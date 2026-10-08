/**
 * NEXUS AI — SHARED INTELLIGENCE CONTRACTS
 * 
 * Defines the standard interfaces shared across:
 * - Member 1 (Document Ingestion, Parsing, OCR, Chunking)
 * - Member 2 (Fact Extraction, Entities, Normalization, Contradiction Detection, Evidence)
 * - Member 3 (Reasoning, Orchestration, UI, Q&A, Case Reports)
 */

// ==========================================
// 1. MEMBER 1 INGESTION SCHEMAS
// ==========================================

export type DocumentProcessingStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface DocumentSourceMetadata {
  id: string;
  name: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'image' | 'scanned_pdf';
  fileSize: number; // bytes
  totalPages: number;
  uploadedAt: string;
  status: DocumentProcessingStatus;
  processingProgress: number; // 0 to 100
  errorMessage?: string;
  documentCategory: 'FINANCIAL' | 'IDENTITY' | 'GRANT' | 'TAX' | 'LEGAL' | 'SUPPORTING';
}

export interface ExtractedChunk {
  chunkId: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  content: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ==========================================
// 2. MEMBER 2 FACT & EVIDENCE SCHEMAS
// ==========================================

export type EntityType = 'PERSON' | 'ORGANIZATION' | 'PROJECT' | 'FINANCIAL_ACCOUNT' | 'GOVERNMENT_BODY' | 'ASSET';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  aliases: string[];
  description?: string;
  mentionCount: number;
  documentsPresent: string[]; // document IDs
}

export interface EvidenceSource {
  documentId: string;
  documentName: string;
  pageNumber: number;
  snippet: string;
  extractedAt: string;
  highlightCoordinates?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface Fact {
  id: string;
  entityId: string;
  entityName: string;
  entityType: EntityType;
  attribute: string;
  value: string | number;
  normalizedValue: string | number;
  unit?: string;
  timestamp?: string; // ISO date or period, e.g. "2025-03-31"
  context: string;
  source: EvidenceSource;
  confidence: number; // 0.0 to 1.0 (e.g. 0.94)
  extractedBy: 'TABLE_PARSER' | 'TEXT_EXTRACTOR' | 'OCR_ENGINE' | 'KEY_VALUE_NORMALIZER';
}

export type FindingCategory = 
  | 'BUDGET_DISCREPANCY' 
  | 'INCOME_MISMATCH' 
  | 'IDENTITY_CONFLICT' 
  | 'TEMPORAL_ANOMALY' 
  | 'POLICY_VIOLATION' 
  | 'MISSING_DATA';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  summary: string;
  entityName: string;
  conflictingFacts: Fact[];
  discrepancyDelta?: {
    expectedOrPrevious: string | number;
    reportedOrNew: string | number;
    difference: string | number;
    differencePercent?: number;
  };
  reasoning: string;
  confidence: number; // derived confidence (e.g. 0.92)
  recommendation: string;
  detectedAt: string;
}

export interface MissingInformation {
  id: string;
  entityName: string;
  requiredAttribute: string;
  expectedInDocumentCategory: string;
  impactLevel: 'CRITICAL' | 'WARNING' | 'INFORMATIONAL';
  reason: string;
  suggestedRemedy: string;
}

export interface TemporalNode {
  id: string;
  entityName: string;
  attribute: string;
  periodOrDate: string;
  isoDate: string;
  value: string | number;
  previousValue?: string | number;
  deltaPercent?: number;
  evidence: EvidenceSource;
}

export interface RelationshipEdge {
  id: string;
  sourceId: string; // Entity or Document ID
  sourceName: string;
  sourceType: string;
  targetId: string; // Entity or Fact ID
  targetName: string;
  targetType: string;
  relationType: 'EMPLOYED_BY' | 'APPLIED_FOR' | 'DISBURSED_TO' | 'REPORTED_IN' | 'DIRECTOR_OF' | 'AUDITED_BY' | 'CONTRADICTS' | 'REFERENCES';
  confidence: number;
}

// ==========================================
// 3. MEMBER 3 ORCHESTRATION & DECISION SCHEMAS
// ==========================================

export interface SystemMetrics {
  totalDocuments: number;
  processedDocuments: number;
  totalFacts: number;
  totalEntities: number;
  totalRelationships: number;
  totalConflicts: number;
  criticalConflicts: number;
  missingDataCount: number;
  evidenceCount: number;
  averageConfidence: number; // e.g. 0.915
  systemStatus: 'ONLINE' | 'PROCESSING' | 'READY' | 'DEGRADED';
}

export interface CaseDecisionReport {
  caseId: string;
  caseTitle: string;
  caseType: 'LOAN_VERIFICATION' | 'GRANT_ASSESSMENT' | 'INSURANCE_CLAIM' | 'COMPLIANCE_AUDIT';
  generatedAt: string;
  decisionStatus: 'REVIEW_REQUIRED' | 'PENDING_DOCUMENTATION' | 'ELEVATED_RISK' | 'LOW_RISK_VERIFIED';
  executiveSummary: string;
  riskScore: number; // 0 to 100
  criticalFindings: Finding[];
  missingInformation: MissingInformation[];
  temporalTrajectory: TemporalNode[];
  keyRelationships: RelationshipEdge[];
  traceableEvidence: EvidenceSource[];
  overallConfidence: number;
  recommendedHumanActions: string[];
  disclaimer: string;
}

export interface QARequest {
  query: string;
  conversationHistory?: Array<{ sender: 'user' | 'assistant'; text: string }>;
  focusEntity?: string;
}

export interface QAResponse {
  query: string;
  answer: string;
  confidence: number;
  citedFacts: Fact[];
  citedEvidence: EvidenceSource[];
  suggestedFollowUps: string[];
}
