/**
 * NEXUS AI — Contradiction & Cross-Document Comparison Engine
 *
 * Implements deterministic validation to differentiate between:
 *   - CONTRADICTION (Conflicting claims for the same timeframe or invariant attributes)
 *   - POSSIBLE_CONTRADICTION (Discrepancy with ambiguous time or lower confidence)
 *   - TEMPORAL_CHANGE (Progression or revision across distinct time points)
 *   - CONSISTENT (Cross-document verification of matching facts)
 *   - DUPLICATE (Redundant identical facts)
 */

import type {
  Fact,
  FactCluster,
  Finding,
  FindingType,
  FindingSeverity,
  EvidenceSource,
} from '../models/types.ts';
import { ConfidenceEngine } from '../confidence/confidence_engine.ts';

// Invariant attributes that MUST NEVER change for an entity
const INVARIANT_ATTRIBUTES = new Set([
  'date_of_birth',
  'dob',
  'pan_number',
  'aadhaar_number',
  'passport_number',
  'father_name',
  'mother_name',
  'gender',
]);

export class ContradictionEngine {
  private confidenceEngine: ConfidenceEngine;
  private findingCounter = 0;

  constructor(confidenceEngine?: ConfidenceEngine) {
    this.confidenceEngine = confidenceEngine || new ConfidenceEngine();
  }

  private generateFindingId(): string {
    this.findingCounter++;
    return `FINDING_${String(this.findingCounter).padStart(4, '0')}`;
  }

  /**
   * Analyzes all fact clusters and generates validated findings.
   */
  public analyzeClusters(clusters: Map<string, FactCluster>): Finding[] {
    const findings: Finding[] = [];

    for (const [_, cluster] of clusters) {
      if (cluster.facts.length < 2) {
        continue;
      }

      const clusterFindings = this.compareFactsInCluster(cluster);
      findings.push(...clusterFindings);
    }

    return findings;
  }

  /**
   * Compares facts within a single (entity_id, attribute) cluster.
   * Optimally groups by distinct values to eliminate O(N^2) memory explosion on large document sets.
   */
  private compareFactsInCluster(cluster: FactCluster): Finding[] {
    const findings: Finding[] = [];
    const facts = cluster.facts;
    const isInvariant = INVARIANT_ATTRIBUTES.has(cluster.attribute);

    // Group facts by standardized value
    const valueGroups = new Map<string, Fact[]>();
    for (const f of facts) {
      const vKey = f.normalized_value?.standardized_representation ?? String(f.normalized_value?.raw_value ?? 'unknown');
      if (!valueGroups.has(vKey)) {
        valueGroups.set(vKey, []);
      }
      valueGroups.get(vKey)!.push(f);
    }

    const distinctGroupKeys = Array.from(valueGroups.keys());

    // 1. If all facts agree on the same value across multiple documents
    if (distinctGroupKeys.length === 1 && facts.length >= 2) {
      const sampleA = facts[0];
      const sampleB = facts[1];
      const sameDoc = facts.every(f => f.evidence.document_id === sampleA.evidence.document_id);
      const type: FindingType = sameDoc ? 'DUPLICATE' : 'CONSISTENT';
      const docCount = new Set(facts.map(f => f.evidence.document_name)).size;
      
      const title = sameDoc
        ? `Duplicate Fact: ${cluster.attribute}`
        : `Verified Cross-Document Consistency: ${cluster.attribute}`;
      const description = sameDoc
        ? `Identical claim of ${sampleA.normalized_value.standardized_representation} appears ${facts.length} times within ${sampleA.evidence.document_name}.`
        : `Consistent value ${sampleA.normalized_value.standardized_representation} independently verified across ${docCount} documents.`;

      const confidence = this.confidenceEngine.calculateConfidence({
        facts: [sampleA, sampleB],
        comparisonType: type,
        valueDiscrepancy: 0,
      });

      findings.push({
        finding_id: this.generateFindingId(),
        type,
        severity: 'INFORMATIONAL',
        title,
        description,
        entity_id: cluster.entity_id,
        attribute: cluster.attribute,
        facts: facts.slice(0, 4),
        evidence: facts.slice(0, 4).map(f => f.evidence),
        confidence,
        timestamp: new Date().toISOString(),
      });
      return findings;
    }

    // 2. Compare distinct value groups (O(K^2) where K is distinct values, max K <= 5)
    for (let i = 0; i < distinctGroupKeys.length && findings.length < 15; i++) {
      for (let j = i + 1; j < distinctGroupKeys.length && findings.length < 15; j++) {
        const groupA = valueGroups.get(distinctGroupKeys[i])!;
        const groupB = valueGroups.get(distinctGroupKeys[j])!;

        const factA = groupA[0];
        const factB = groupB[0];

        const comparison = this.compareFactPair(factA, factB, isInvariant, cluster.attribute);
        if (comparison) {
          findings.push(comparison);
        }
      }
    }

    return findings;
  }

  /**
   * Compares a pair of facts asserting the same attribute on the same entity.
   */
  private compareFactPair(
    factA: Fact,
    factB: Fact,
    isInvariant: boolean,
    attribute: string
  ): Finding | null {
    const valA = factA.normalized_value;
    const valB = factB.normalized_value;

    const timeA = factA.temporal_context;
    const timeB = factB.temporal_context;

    // 1. Check if values match
    const areValuesEqual = this.checkValueEquality(valA, valB);

    const evidenceList: EvidenceSource[] = [factA.evidence, factB.evidence];

    if (areValuesEqual) {
      // Check if from same document or different
      const sameDoc = factA.evidence.document_id === factB.evidence.document_id;
      const type: FindingType = sameDoc ? 'DUPLICATE' : 'CONSISTENT';
      const title = sameDoc
        ? `Duplicate Fact: ${attribute}`
        : `Verified Cross-Document Consistency: ${attribute}`;
      const description = sameDoc
        ? `Identical claim of ${valA.standardized_representation} appears redundantly within ${factA.evidence.document_name}.`
        : `Consistent value ${valA.standardized_representation} independently verified across "${factA.evidence.document_name}" (p.${factA.evidence.page_number}) and "${factB.evidence.document_name}" (p.${factB.evidence.page_number}).`;

      const confidence = this.confidenceEngine.calculateConfidence({
        facts: [factA, factB],
        comparisonType: type,
        valueDiscrepancy: 0,
      });

      return {
        finding_id: this.generateFindingId(),
        type,
        severity: 'INFORMATIONAL',
        title,
        description,
        facts: [factA, factB],
        evidence: evidenceList,
        confidence,
        recommended_action: sameDoc
          ? 'No action required; duplicate verified.'
          : 'Mark attribute as verified across multiple source documents.',
        metadata: {
          entity_id: factA.entity_id,
          attribute,
        },
      };
    }

    // Values DO NOT match! Now evaluate Temporal vs Contradiction
    const hasDistinctTimes = this.checkDistinctTimePoints(timeA, timeB);

    // If invariant attribute (e.g. DOB or PAN), different values are ALWAYS a contradiction!
    if (isInvariant) {
      const confidence = this.confidenceEngine.calculateConfidence({
        facts: [factA, factB],
        comparisonType: 'CONTRADICTION',
        valueDiscrepancy: 1.0,
      });

      return {
        finding_id: this.generateFindingId(),
        type: 'CONTRADICTION',
        severity: 'CRITICAL',
        title: `Identity Discrepancy: Conflicting ${attribute}`,
        description: `Direct contradiction on invariant identity attribute "${attribute}". Document "${factA.evidence.document_name}" states "${valA.raw_value}", whereas "${factB.evidence.document_name}" states "${valB.raw_value}". Invariant identity fields cannot differ.`,
        facts: [factA, factB],
        evidence: evidenceList,
        confidence,
        recommended_action: `Halt automated approval. Require physical KYC re-verification for ${attribute}.`,
        metadata: {
          entity_id: factA.entity_id,
          attribute,
        },
      };
    }

    // If times are explicitly different and attribute is time-variant -> TEMPORAL_CHANGE
    if (hasDistinctTimes) {
      const deltaDesc = this.computeDeltaDescription(valA, valB);
      const confidence = this.confidenceEngine.calculateConfidence({
        facts: [factA, factB],
        comparisonType: 'TEMPORAL_CHANGE',
        valueDiscrepancy: 0.1,
      });

      return {
        finding_id: this.generateFindingId(),
        type: 'TEMPORAL_CHANGE',
        severity: 'LOW',
        title: `Temporal Progression: ${attribute}`,
        description: `Value for "${attribute}" evolved over time: ${valA.standardized_representation} (${timeA.date_string || timeA.raw_time}) → ${valB.standardized_representation} (${timeB.date_string || timeB.raw_time}). ${deltaDesc}`,
        facts: [factA, factB],
        evidence: evidenceList,
        confidence,
        recommended_action: 'Record historical trend in applicant timeline. Confirm latest value is current.',
        metadata: {
          entity_id: factA.entity_id,
          attribute,
          delta: deltaDesc,
        },
      };
    }

    // Times are identical OR unspecified/fuzzy, but values diverge!
    // Determine severity based on magnitude of discrepancy
    const numericDiscrepancy = this.computeRelativeDifference(valA, valB);

    let type: FindingType = 'CONTRADICTION';
    let severity: FindingSeverity = 'HIGH';

    if (timeA.granularity === 'UNSPECIFIED' || timeB.granularity === 'UNSPECIFIED') {
      type = 'POSSIBLE_CONTRADICTION';
      severity = 'MEDIUM';
    }

    if (numericDiscrepancy > 0.30) {
      severity = 'HIGH';
    } else if (numericDiscrepancy < 0.10 && numericDiscrepancy > 0) {
      severity = 'MEDIUM';
    }

    const title = `${type === 'CONTRADICTION' ? 'Direct Contradiction' : 'Potential Mismatch'}: ${attribute}`;
    const desc = `Discrepancy found for "${attribute}": "${factA.evidence.document_name}" (p.${factA.evidence.page_number}) indicates "${valA.raw_value}", while "${factB.evidence.document_name}" (p.${factB.evidence.page_number}) indicates "${valB.raw_value}". Discrepancy ratio: ${(numericDiscrepancy * 100).toFixed(1)}%.`;

    const confidence = this.confidenceEngine.calculateConfidence({
      facts: [factA, factB],
      comparisonType: type,
      valueDiscrepancy: numericDiscrepancy,
    });

    const recommended =
      severity === 'HIGH'
        ? `Request applicant clarification or official bank reconciliation for ${attribute}.`
        : `Review contextual differences or recent pay stub to resolve variance.`;

    return {
      finding_id: this.generateFindingId(),
      type,
      severity,
      title,
      description: desc,
      facts: [factA, factB],
      evidence: evidenceList,
      confidence,
      recommended_action: recommended,
      metadata: {
        entity_id: factA.entity_id,
        attribute,
        delta: (numericDiscrepancy * 100).toFixed(1) + '%',
      },
    };
  }

  private checkValueEquality(a: any, b: any): boolean {
    // Numeric / Currency
    if (a.parsed_numeric !== undefined && b.parsed_numeric !== undefined) {
      const diff = Math.abs(a.parsed_numeric - b.parsed_numeric);
      const maxVal = Math.max(Math.abs(a.parsed_numeric), Math.abs(b.parsed_numeric), 1);
      return diff / maxVal < 0.005; // Within 0.5% tolerance
    }

    // Dates
    if (a.parsed_date?.date_string && b.parsed_date?.date_string) {
      return a.parsed_date.date_string === b.parsed_date.date_string;
    }

    // Standardized text
    return (
      a.standardized_representation.toLowerCase().trim() ===
      b.standardized_representation.toLowerCase().trim()
    );
  }

  private checkDistinctTimePoints(tA: any, tB: any): boolean {
    if (!tA?.date_string || !tB?.date_string) return false;
    if (tA.granularity === 'UNSPECIFIED' || tB.granularity === 'UNSPECIFIED') return false;
    return tA.date_string !== tB.date_string;
  }

  private computeRelativeDifference(a: any, b: any): number {
    if (a.parsed_numeric !== undefined && b.parsed_numeric !== undefined) {
      const minVal = Math.min(Math.abs(a.parsed_numeric), Math.abs(b.parsed_numeric));
      const maxVal = Math.max(Math.abs(a.parsed_numeric), Math.abs(b.parsed_numeric));
      if (maxVal === 0) return 0;
      return (maxVal - minVal) / maxVal;
    }
    return 1.0;
  }

  private computeDeltaDescription(a: any, b: any): string {
    if (a.parsed_numeric !== undefined && b.parsed_numeric !== undefined) {
      const diff = b.parsed_numeric - a.parsed_numeric;
      const pct = (diff / Math.max(a.parsed_numeric, 1)) * 100;
      const sign = diff >= 0 ? '+' : '';
      return `Delta: ${sign}${diff.toLocaleString()} (${sign}${pct.toFixed(1)}%)`;
    }
    return `Changed from "${a.standardized_representation}" to "${b.standardized_representation}"`;
  }
}
