/**
 * NEXUS AI — Member 2: Information Intelligence Engine
 * Core Data Models & Schemas
 *
 * Core Axiom: "The unit of intelligence is the FACT, not the document."
 * Fact = ENTITY + ATTRIBUTE + VALUE + TIME + CONTEXT + SOURCE + CONFIDENCE
 */

// -------------------------------------------------------------------------
// 1. Evidence & Provenance Models
// -------------------------------------------------------------------------

export interface EvidenceSource {
  document_id: string;
  document_name: string;
  page_number: number;
  source_text: string;
  context_snippet?: string;
  bounding_box?: {
    top?: number;
    left?: number;
    width?: number;
    height?: number;
  };
  extraction_confidence?: number; // 0.0 - 1.0 from Member 1 extractor
}

// -------------------------------------------------------------------------
// 2. Entity Models
// -------------------------------------------------------------------------

export type EntityType =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'ACCOUNT'
  | 'ASSET'
  | 'LOCATION'
  | 'IDENTIFIER';

export interface RawEntityMention {
  mention_id: string;
  raw_name: string;
  entity_type: EntityType;
  identifiers?: Record<string, string>; // e.g. { "pan": "ABCDE1234F", "phone": "9876543210" }
  attributes?: Record<string, any>;
  evidence: EvidenceSource;
}

export interface ResolvedEntity {
  entity_id: string; // e.g. "PERSON_001"
  canonical_name: string; // e.g. "Ramesh Kumar"
  entity_type: EntityType;
  aliases: string[]; // e.g. ["R. Kumar", "Ramesh K.", "R KUMAR"]
  identifiers: Record<string, string>; // e.g. { pan: "ABCDE1234F", phone: "9876543210" }
  mention_ids: string[];
  confidence_score: number; // 0.0 - 1.0
  resolution_rationale: string;
}

// -------------------------------------------------------------------------
// 3. Temporal Models
// -------------------------------------------------------------------------

export type TimeGranularity = 'EXACT' | 'DAY' | 'MONTH' | 'QUARTER' | 'YEAR' | 'UNSPECIFIED';

export interface NormalizedTime {
  raw_time?: string;
  iso_timestamp?: string; // e.g. "2024-03-01T00:00:00.000Z"
  date_string?: string;    // e.g. "2024-03-01"
  year?: number;
  month?: number;          // 1 - 12
  quarter?: string;        // "2024-Q1"
  granularity: TimeGranularity;
}

// -------------------------------------------------------------------------
// 4. Normalized Value Models
// -------------------------------------------------------------------------

export type ValueDataType =
  | 'CURRENCY'
  | 'NUMBER'
  | 'PERCENTAGE'
  | 'DATE'
  | 'TEXT'
  | 'BOOLEAN'
  | 'IDENTIFIER';

export interface NormalizedCurrency {
  amount: number;          // e.g. 1500000
  currency: string;        // e.g. "INR", "USD"
  formatted: string;       // e.g. "₹1,500,000 (15 Lakh)"
  scale?: string;          // e.g. "LAKH", "CRORE", "THOUSAND"
}

export interface NormalizedValue {
  data_type: ValueDataType;
  raw_value: string | number;
  parsed_numeric?: number;
  parsed_currency?: NormalizedCurrency;
  parsed_date?: NormalizedTime;
  parsed_text?: string;
  unit?: string;
  standardized_representation: string; // Uniform string representation for comparison
}

// -------------------------------------------------------------------------
// 5. Fact Models
// -------------------------------------------------------------------------

export interface RawFact {
  fact_id: string;
  entity_mention_id?: string;
  raw_entity_name?: string;
  entity_type?: EntityType;
  attribute: string; // e.g. "monthly_income", "employer_name", "date_of_birth"
  raw_value: string | number;
  raw_time?: string;
  context?: string; // e.g. "stated on loan application form", "salary credit line item"
  evidence: EvidenceSource;
}

export interface Fact {
  fact_id: string;
  entity_id: string; // Linked canonical entity ID (e.g. "PERSON_001")
  attribute: string; // Canonical attribute (e.g. "monthly_income")
  normalized_value: NormalizedValue;
  temporal_context: NormalizedTime;
  context: string;
  evidence: EvidenceSource;
  extraction_confidence: number;
}

// -------------------------------------------------------------------------
// 6. Fact Cluster
// -------------------------------------------------------------------------

export interface FactCluster {
  cluster_id: string;
  entity_id: string;
  attribute: string;
  facts: Fact[];
}

// -------------------------------------------------------------------------
// 7. Findings & Confidence Models (Strict Section 13 Contract)
// -------------------------------------------------------------------------

export type FindingType =
  | 'CONTRADICTION'
  | 'POSSIBLE_CONTRADICTION'
  | 'TEMPORAL_CHANGE'
  | 'CONSISTENT'
  | 'MISSING_INFORMATION'
  | 'DUPLICATE'
  | 'RELATED_INFORMATION';

export type FindingSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFORMATIONAL';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ConfidenceAssessment {
  level: ConfidenceLevel;
  score: number; // 0.0 - 1.0
  factors: {
    extraction_confidence: number;
    entity_match_confidence: number;
    normalization_certainty: number;
    source_quality: number;
    comparison_certainty: number;
    evidence_completeness: number;
  };
  explanation: string;
}

export interface Finding {
  finding_id: string;
  type: FindingType;
  severity: FindingSeverity;
  title: string;
  description: string;
  facts: Fact[];
  evidence: EvidenceSource[];
  confidence: ConfidenceAssessment;
  recommended_action: string;
  metadata?: {
    entity_id?: string;
    attribute?: string;
    delta?: number | string;
    timeline_ids?: string[];
  };
}

// -------------------------------------------------------------------------
// 8. Temporal Timeline Models
// -------------------------------------------------------------------------

export interface TimelineEvent {
  event_id: string;
  date_string: string;
  iso_timestamp?: string;
  granularity: TimeGranularity;
  attribute: string;
  value: NormalizedValue;
  fact_id: string;
  document_name: string;
  page_number: number;
  source_text: string;
  delta_from_previous?: {
    numeric_delta?: number;
    percentage_change?: number;
    direction: 'INCREASE' | 'DECREASE' | 'UNCHANGED' | 'MODIFIED';
  };
}

export interface EntityTimeline {
  entity_id: string;
  canonical_name: string;
  attribute: string;
  events: TimelineEvent[];
  summary: string;
}

// -------------------------------------------------------------------------
// 9. Input & Output Contract Schemas
// -------------------------------------------------------------------------

export interface IngestedDocumentInfo {
  document_id: string;
  document_name: string;
  doc_type: string; // e.g. "LOAN_APPLICATION", "BANK_STATEMENT", "SALARY_SLIP", "PAN_CARD"
  file_hash?: string;
  page_count?: number;
  upload_timestamp?: string;
}

export interface IngestedCasePayload {
  case_id: string;
  case_type?: 'LOAN_VERIFICATION' | 'INSURANCE_CLAIM' | 'GRANT_APPLICATION' | 'GENERAL';
  documents: IngestedDocumentInfo[];
  raw_entities: RawEntityMention[];
  raw_facts: RawFact[];
}

export interface MissingInfoItem {
  attribute: string;
  label: string;
  severity: FindingSeverity;
  required_for: string;
  recommended_source: string;
  is_missing: boolean;
}

export interface IntelligenceReport {
  case_id: string;
  generated_at: string;
  summary: {
    total_documents: number;
    total_raw_facts: number;
    total_resolved_entities: number;
    findings_count_by_type: Record<FindingType, number>;
    critical_findings_count: number;
    high_findings_count: number;
    verification_status: 'FLAGGED_FOR_REVIEW' | 'VERIFIED' | 'INCOMPLETE' | 'HIGH_RISK';
  };
  resolved_entities: ResolvedEntity[];
  findings: Finding[];
  timelines: EntityTimeline[];
  missing_information: MissingInfoItem[];
  all_facts: Fact[];
}
