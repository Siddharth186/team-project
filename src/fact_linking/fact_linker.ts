/**
 * NEXUS AI — Fact Linking Engine
 *
 * Connects raw facts into canonical facts linked to resolved entities,
 * standardizes attributes, and groups them into Fact Clusters by (entity_id, attribute).
 */

import type { RawFact, Fact, ResolvedEntity, FactCluster } from '../models/types.ts';
import { normalizeFactValue } from '../normalization/index.ts';
import { normalizeDateString } from '../normalization/date.ts';
import { compareNameVariants } from '../entity_resolution/entity_resolver.ts';

// Attribute synonym map
const ATTRIBUTE_SYNONYMS: Record<string, string> = {
  // Income
  salary: 'monthly_income',
  salary_credit: 'monthly_income',
  monthly_salary: 'monthly_income',
  take_home_pay: 'monthly_income',
  net_salary: 'monthly_income',
  gross_income: 'monthly_income',
  annual_salary: 'annual_income',
  yearly_income: 'annual_income',

  // Loan & Budget
  requested_loan: 'loan_amount_requested',
  loan_amount: 'loan_amount_requested',
  sanctioned_amount: 'sanctioned_loan_amount',
  project_budget: 'budget',
  total_budget: 'budget',

  // Identity & Personal
  dob: 'date_of_birth',
  birth_date: 'date_of_birth',
  pan: 'pan_number',
  pan_card: 'pan_number',
  aadhaar: 'aadhaar_number',
  aadhaar_card: 'aadhaar_number',
  passport_no: 'passport_number',
  phone_number: 'contact_number',
  mobile_number: 'contact_number',
  mobile: 'contact_number',
  residence_address: 'address',
  residential_address: 'address',
  permanent_address: 'address',

  // Employment
  employer: 'employer_name',
  company_name: 'employer_name',
  organization: 'employer_name',
  designation: 'job_title',
  occupation: 'job_title',
};

export function canonicalizeAttribute(attr: string): string {
  const clean = attr.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return ATTRIBUTE_SYNONYMS[clean] || clean;
}

export class FactLinker {
  /**
   * Links raw facts to resolved entities and normalizes their values and timestamps.
   */
  public linkFacts(rawFacts: RawFact[], resolvedEntities: ResolvedEntity[]): Fact[] {
    const linkedFacts: Fact[] = [];

    for (const raw of rawFacts) {
      // 1. Identify canonical entity_id
      let matchedEntityId = 'UNKNOWN_ENTITY';

      // Method A: Check mention ID
      if (raw.entity_mention_id) {
        const found = resolvedEntities.find(e => e.mention_ids.includes(raw.entity_mention_id!));
        if (found) {
          matchedEntityId = found.entity_id;
        }
      }

      // Method B: Check raw entity name against resolved entities
      if (matchedEntityId === 'UNKNOWN_ENTITY' && raw.raw_entity_name) {
        let bestScore = 0;
        let bestEntity: ResolvedEntity | null = null;

        for (const ent of resolvedEntities) {
          const namesToTest = [ent.canonical_name, ...ent.aliases];
          for (const name of namesToTest) {
            const cmp = compareNameVariants(name, raw.raw_entity_name);
            if (cmp.matches && cmp.score > bestScore) {
              bestScore = cmp.score;
              bestEntity = ent;
            }
          }
        }

        if (bestEntity && bestScore >= 0.80) {
          matchedEntityId = bestEntity.entity_id;
        }
      }

      // Fallback: If only one PERSON or ORGANIZATION entity exists in the case, associate with it
      if (matchedEntityId === 'UNKNOWN_ENTITY' && resolvedEntities.length === 1) {
        matchedEntityId = resolvedEntities[0].entity_id;
      }

      // 2. Canonicalize attribute
      const canonicalAttr = canonicalizeAttribute(raw.attribute);

      // 3. Normalize value
      const normalizedValue = normalizeFactValue(canonicalAttr, raw.raw_value, raw.raw_time);

      // 4. Normalize temporal context
      const temporalContext = normalizeDateString(raw.raw_time);

      const extractionConfidence =
        raw.evidence?.extraction_confidence !== undefined ? raw.evidence.extraction_confidence : 0.90;

      const fact: Fact = {
        fact_id: raw.fact_id,
        entity_id: matchedEntityId,
        attribute: canonicalAttr,
        normalized_value: normalizedValue,
        temporal_context: temporalContext,
        context: raw.context || '',
        evidence: raw.evidence,
        extraction_confidence: extractionConfidence,
      };

      linkedFacts.push(fact);
    }

    return linkedFacts;
  }

  /**
   * Groups linked facts into clusters by (entity_id, attribute).
   */
  public clusterFacts(facts: Fact[]): Map<string, FactCluster> {
    const clusters = new Map<string, FactCluster>();

    for (const fact of facts) {
      const clusterKey = `${fact.entity_id}::${fact.attribute}`;

      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, {
          cluster_id: clusterKey,
          entity_id: fact.entity_id,
          attribute: fact.attribute,
          facts: [],
        });
      }

      clusters.get(clusterKey)!.facts.push(fact);
    }

    return clusters;
  }
}
