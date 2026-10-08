/**
 * NEXUS AI — Missing Information Engine
 *
 * Deterministically validates presence of required fields and documentation
 * across multi-document packages (Loans, Grants, Insurance, KYC).
 *
 * Features:
 *   - Explicit missing field detection (against checklist schemas)
 *   - Semantic document absence (detecting missing mandatory document types)
 *   - Generation of Section 13 compliant MISSING_INFORMATION findings
 */

import type {
  Fact,
  IngestedDocumentInfo,
  Finding,
  FindingSeverity,
  MissingInfoItem,
  ResolvedEntity,
} from '../models/types.ts';
import { ConfidenceEngine } from '../confidence/confidence_engine.ts';

export interface ChecklistRequirement {
  attribute: string;
  label: string;
  severity: FindingSeverity;
  required_for: string;
  recommended_source: string;
  aliases: string[];
}

export const LOAN_VERIFICATION_CHECKLIST: ChecklistRequirement[] = [
  {
    attribute: 'name',
    label: 'Applicant Full Name',
    severity: 'CRITICAL',
    required_for: 'Identity verification',
    recommended_source: 'Application Form / PAN Card',
    aliases: ['name', 'full_name', 'applicant_name'],
  },
  {
    attribute: 'date_of_birth',
    label: 'Date of Birth',
    severity: 'HIGH',
    required_for: 'Age eligibility & Credit bureau check',
    recommended_source: 'PAN Card / Passport / Driving License',
    aliases: ['date_of_birth', 'dob', 'birth_date'],
  },
  {
    attribute: 'identity_proof',
    label: 'Government Identity Proof (PAN / Aadhaar / Passport)',
    severity: 'CRITICAL',
    required_for: 'Statutory KYC compliance',
    recommended_source: 'PAN Card / Passport document',
    aliases: ['pan_number', 'pan', 'aadhaar_number', 'passport_number', 'identity_proof'],
  },
  {
    attribute: 'monthly_income',
    label: 'Income / Salary Evidence',
    severity: 'HIGH',
    required_for: 'Debt-to-income and repayment capacity',
    recommended_source: 'Salary Slip / Bank Statement salary credit',
    aliases: ['monthly_income', 'salary', 'salary_credit', 'net_salary'],
  },
  {
    attribute: 'employment_status',
    label: 'Employment / Employer Details',
    severity: 'HIGH',
    required_for: 'Occupational stability check',
    recommended_source: 'Employment Certificate / Offer Letter / Salary Slip',
    aliases: ['employment_status', 'employer_name', 'employer', 'job_title'],
  },
  {
    attribute: 'bank_account',
    label: 'Bank Account Details',
    severity: 'HIGH',
    required_for: 'Loan disbursement & ECS/NACH setup',
    recommended_source: 'Bank Statement / Cancelled Cheque',
    aliases: ['bank_account', 'account_number', 'bank_balance'],
  },
  {
    attribute: 'address',
    label: 'Residential Address',
    severity: 'HIGH',
    required_for: 'Physical residence verification',
    recommended_source: 'Utility Bill / Rental Agreement / Passport',
    aliases: ['address', 'residential_address', 'permanent_address'],
  },
  {
    attribute: 'signature',
    label: 'Applicant Signature / Consent Verification',
    severity: 'CRITICAL',
    required_for: 'Legal contract enforceability',
    recommended_source: 'Application Form Declaration Page',
    aliases: ['signature', 'applicant_signature', 'consent_signed'],
  },
];

export class MissingInfoEngine {
  private confidenceEngine: ConfidenceEngine;
  private findingCounter = 0;

  constructor(confidenceEngine?: ConfidenceEngine) {
    this.confidenceEngine = confidenceEngine || new ConfidenceEngine();
  }

  private generateFindingId(): string {
    this.findingCounter++;
    return `MISSING_${String(this.findingCounter).padStart(4, '0')}`;
  }

  /**
   * Evaluates facts, entities, and ingested documents against required checklist.
   */
  public evaluateMissingInformation(
    facts: Fact[],
    documents: IngestedDocumentInfo[],
    entities: ResolvedEntity[] = [],
    checklist: ChecklistRequirement[] = LOAN_VERIFICATION_CHECKLIST
  ): { items: MissingInfoItem[]; findings: Finding[] } {
    const items: MissingInfoItem[] = [];
    const findings: Finding[] = [];

    // Collect all available attributes from facts
    const availableAttributes = new Set<string>();
    for (const f of facts) {
      if (
        f.normalized_value?.standardized_representation &&
        f.normalized_value.standardized_representation.trim() !== '' &&
        f.normalized_value.standardized_representation.toLowerCase() !== 'n/a' &&
        f.normalized_value.standardized_representation.toLowerCase() !== 'none'
      ) {
        availableAttributes.add(f.attribute.toLowerCase());
      }
    }

    // Also check entity identifiers and canonical names
    for (const ent of entities) {
      if (ent.canonical_name && ent.canonical_name.trim() !== '') {
        availableAttributes.add('name');
        availableAttributes.add('applicant_name');
        availableAttributes.add('full_name');
      }
      for (const [idKey, idVal] of Object.entries(ent.identifiers || {})) {
        if (idVal && idVal.trim() !== '') {
          availableAttributes.add(idKey.toLowerCase());
          if (idKey.toLowerCase() === 'account_number') {
            availableAttributes.add('bank_account');
          }
          if (['pan', 'aadhaar', 'passport'].includes(idKey.toLowerCase())) {
            availableAttributes.add('identity_proof');
          }
        }
      }
    }

    // Evaluate each requirement in checklist
    for (const req of checklist) {
      const isPresent = req.aliases.some(alias => availableAttributes.has(alias.toLowerCase()));

      items.push({
        attribute: req.attribute,
        label: req.label,
        severity: req.severity,
        required_for: req.required_for,
        recommended_source: req.recommended_source,
        is_missing: !isPresent,
      });

      if (!isPresent) {
        const finding: Finding = {
          finding_id: this.generateFindingId(),
          type: 'MISSING_INFORMATION',
          severity: req.severity,
          title: `Missing Required Information: ${req.label}`,
          description: `Mandatory field "${req.label}" is missing across all submitted documents. This information is required for: ${req.required_for}.`,
          facts: [],
          evidence: [],
          confidence: {
            level: 'HIGH',
            score: 0.95,
            factors: {
              extraction_confidence: 1.0,
              entity_match_confidence: 1.0,
              normalization_certainty: 1.0,
              source_quality: 1.0,
              comparison_certainty: 1.0,
              evidence_completeness: 1.0,
            },
            explanation: `Deterministic schema validation: No facts asserting ${req.attribute} found in any document.`,
          },
          recommended_action: `Request applicant or partner to submit documentation containing ${req.label} (${req.recommended_source}).`,
          metadata: {
            attribute: req.attribute,
          },
        };

        findings.push(finding);
      }
    }

    // Semantic Document Absence Check (e.g. check if crucial doc types are absent)
    const docTypesPresent = new Set(documents.map(d => d.doc_type?.toUpperCase()));

    if (!docTypesPresent.has('BANK_STATEMENT') && !docTypesPresent.has('STATEMENT')) {
      const docFinding: Finding = {
        finding_id: this.generateFindingId(),
        type: 'MISSING_INFORMATION',
        severity: 'HIGH',
        title: 'Missing Document Package: Official Bank Statement',
        description: 'No Bank Statement document was uploaded in the application bundle. Financial verification cannot be corroborated independently.',
        facts: [],
        evidence: [],
        confidence: {
          level: 'HIGH',
          score: 0.99,
          factors: {
            extraction_confidence: 1.0,
            entity_match_confidence: 1.0,
            normalization_certainty: 1.0,
            source_quality: 1.0,
            comparison_certainty: 1.0,
            evidence_completeness: 1.0,
          },
          explanation: 'Deterministic document inventory audit.',
        },
        recommended_action: 'Request applicant to upload latest 3 to 6 months bank statement in PDF format.',
      };
      findings.push(docFinding);
    }

    return { items, findings };
  }
}
