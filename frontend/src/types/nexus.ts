export type DocumentProcessingStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface DocumentItem {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  totalPages: number;
  uploadedAt: string;
  status: DocumentProcessingStatus;
  processingProgress: number;
  documentCategory: string;
  errorMessage?: string;
  batchId?: string;
  batchName?: string;
  report?: any;
  documentSpecs?: any;
  tags?: string[];
}

export interface BatchGroup {
  batchId: string;
  batchName: string;
  uploadedAt: string;
  documents: DocumentItem[];
  totalFiles: number;
  totalSize: number;
  status: DocumentProcessingStatus;
  findingsCount?: number;
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
  entityType: string;
  attribute: string;
  value: string | number;
  normalizedValue: string | number;
  unit?: string;
  timestamp?: string;
  context: string;
  source: EvidenceSource;
  confidence: number;
  extractedBy: string;
}

export interface Finding {
  id: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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
  confidence: number;
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

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  category: 'entity' | 'document' | 'fact';
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  confidence: number;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

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
  averageConfidence: number;
  systemStatus: string;
}

export interface QAResponse {
  query: string;
  answer: string;
  confidence: number;
  citedFacts: Fact[];
  citedEvidence: EvidenceSource[];
  suggestedFollowUps: string[];
}

export interface CaseDecisionReport {
  caseId: string;
  caseTitle: string;
  caseType: string;
  generatedAt: string;
  decisionStatus: 'REVIEW_REQUIRED' | 'PENDING_DOCUMENTATION' | 'ELEVATED_RISK' | 'LOW_RISK_VERIFIED';
  executiveSummary: string;
  riskScore: number;
  criticalFindings: Finding[];
  missingInformation: MissingInformation[];
  temporalTrajectory: TemporalNode[];
  keyRelationships: GraphEdge[];
  overallConfidence: number;
  recommendedHumanActions: string[];
  disclaimer: string;
}
