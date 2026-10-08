# MEMBER 3: REPOSITORY AUDIT & SYSTEM ARCHITECTURE EVALUATION

**Date:** October 8, 2026  
**Auditor:** Member 3 (Reasoning + Orchestration + User Experience)  
**Branch:** `feature/member3-experience`  
**Target Project:** NEXUS AI — Evidence-Centric Information Intelligence  

---

## 1. Executive Summary

A comprehensive repository inspection was conducted on the current codebase (`c:\Users\Siddharth\team-project`). The repository is at an initial stage following its first commits (`README.md`). Neither Member 1 (Ingestion/Parsing/OCR) nor Member 2 (Fact Extraction/Normalization/Contradiction/Evidence) has committed code to the main branch yet. They are working in independent feature branches that will be merged via Git.

To ensure zero conflicts during Git merge and complete isolation of concerns, Member 3 will:
1. Define formal, typed **Shared Schemas** (`shared/schemas/nexus-intelligence.ts` & Python equivalents) representing Member 1 outputs and Member 2 intelligence contracts.
2. Build the complete **Member 3 Orchestration Layer** (`backend/` or `orchestrator/`), providing API proxying to Member 2's backend, grounded LLM reasoning, retrieval augmented over structured intelligence, and report generation.
3. Build the **NEXUS AI User Interface** (`frontend/`), delivering the futuristic dark glassmorphic UI, dashboard, evidence viewer, temporal view, knowledge graph, upload experience, and "Ask NEXUS" Q&A.
4. Provide a resilient **Mock / Live Adapter mode** pre-loaded with a comprehensive hackathon demonstration case (*"Commercial Loan & Grant Verification: Nexus Solar Energy / Arjun Mehta"*), ensuring the demo works seamlessly whether Member 2's backend is running locally or yet to be integrated.

---

## 2. Component Inspection

### 2.1 Repository Structure
| Component | Existing State | Member 3 Action |
| :--- | :--- | :--- |
| **Frontend** | Not present | Create modern React + Vite + Tailwind CSS + Lucide + D3/Canvas UI in `frontend/` |
| **Backend / Orchestrator** | Not present | Create Node.js / Express or FastAPI orchestration server in `orchestrator/` |
| **Member 1 Output** | Not yet merged | Specify contract: `DocumentIngestionResult`, `ExtractedTable`, `Chunk` |
| **Member 2 Output** | Not yet merged | Specify contract: `Fact`, `Entity`, `Conflict`, `MissingInfo`, `TemporalChange`, `Evidence`, `IntelligenceReport` |
| **Shared Schemas** | Not present | Formulate canonical schemas in `shared/contracts/` |
| **Current UI** | None | Implement dark futuristic design with lime/green accents & glassmorphic hierarchy |
| **Routing** | None | Single Page Application (SPA) with tabbed views: Dashboard, Findings, Evidence, Timeline, Knowledge Graph, Q&A, Case Report, Documents |
| **Database/API Integration** | None | Member 3 API client with dynamic toggle between live Member 2 endpoints and calibrated demonstration dataset |

---

## 3. Shared Integration Contracts

Member 3 consumes outputs from Member 2 (which in turn consumes Member 1). The formal contract is established as:

### 3.1 Fact Model
```typescript
interface Fact {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'PERSON' | 'ORGANIZATION' | 'PROJECT' | 'FINANCIAL' | 'ASSET';
  attribute: string;
  value: string | number;
  normalizedValue: string | number;
  unit?: string;
  timestamp?: string; // ISO date
  context: string;
  source: EvidenceSource;
  confidence: number; // 0.0 - 1.0
}

interface EvidenceSource {
  documentId: string;
  documentName: string;
  pageNumber: number;
  snippet: string;
  boundingBox?: { x: number; y: number; w: number; h: number };
  extractedAt: string;
}
```

### 3.2 Finding / Conflict Model
```typescript
interface Finding {
  id: string;
  category: 'BUDGET_DISCREPANCY' | 'VALUE_MISMATCH' | 'IDENTITY_CONFLICT' | 'TEMPORAL_ANOMALY' | 'POLICY_VIOLATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  entityName: string;
  conflictingFacts: Fact[];
  discrepancyDelta?: string;
  confidence: number;
  recommendation: string;
}
```

### 3.3 Missing Information Model
```typescript
interface MissingInformation {
  id: string;
  entityName: string;
  requiredAttribute: string;
  expectedInDocumentType: string;
  impactLevel: 'CRITICAL' | 'WARNING' | 'INFORMATIONAL';
  reason: string;
}
```

### 3.4 Temporal Trajectory Model
```typescript
interface TemporalEvent {
  id: string;
  entityName: string;
  attribute: string;
  timestamp: string;
  value: string | number;
  previousValue?: string | number;
  deltaPercent?: number;
  evidence: EvidenceSource;
}
```

---

## 4. Member 3 Implementation Plan

1. **Commit 1: Application Shell & Architecture Skeleton**
   - Setup project structure: `frontend/`, `orchestrator/`, `shared/`
   - Dark theme styling, lime accent tokens, Tailwind config, Lucide icons.
2. **Commit 2: Main Dashboard**
   - Metrics bar (Documents, Facts, Relationships, Conflicts, Missing Info, Avg Confidence).
   - NEXUS Core pipeline status (Ingestion -> Facts -> Connections -> Validation -> Intelligence -> Decision).
   - Live intelligence feed & major findings cards.
3. **Commit 3: Document Processing & Upload Experience**
   - Multi-file drag & drop upload.
   - Status tracking: Pending, Processing, Processed, Failed.
   - Genuine progress feedback (file count, stage timer, percentage).
4. **Commit 4: Findings Display**
   - Filterable, sortable list of discrepancies and policy violations.
   - Direct delta computation (Requested vs Approved, Reported vs Bank statement).
5. **Commit 5: Evidence Viewer ("Why did NEXUS say this?")**
   - Side-by-side or modal evidence inspector.
   - Document metadata, page, highlighted exact source snippet, confidence indicator.
6. **Commit 6: Temporal View (Time-Series Intelligence)**
   - Chronological change visualization showing value drift across quarters/years.
   - Clickable timeline nodes linking to exact evidence sources.
7. **Commit 7: Knowledge & Relationship Graph**
   - Visual network of entities (Person, Org, Project, Document, Fact).
   - Relationship links with clear semantic labels.
8. **Commit 8: Natural Language Q&A ("Ask NEXUS")**
   - Grounded conversational interface.
   - Strict factual retrieval over Member 2 structured intelligence (never hallucinates).
   - Inline evidence tags linking to the Evidence Viewer.
9. **Commit 9: Case Report Generation**
   - Decision support report: Executive Summary, Critical Findings, Missing Info, Timeline, Recommendations.
   - Export to Markdown and formatted printable PDF view.
10. **Commit 10: Backend Orchestrator & Member 2 Integration**
    - Express/FastAPI orchestrator with proxy client for Member 2 endpoints.
    - Resilient fallback for demonstration reliability.
11. **Commit 11: End-to-End Testing & Verification**
    - Unit and integration tests, responsive layout verification, documentation files.

---

## 5. Non-Interference Guarantee

Member 3 strictly limits all work to:
- `frontend/`
- `orchestrator/`
- `shared/contracts/`
- Root documentation files (`MEMBER3_*.md`)

No code or directories reserved for Member 1 (`ingestion/`, `ocr/`, `parsers/`) or Member 2 (`facts/`, `validation/`, `engine/`) will be touched or overwritten. When git branches are merged, Member 3's frontend and orchestrator will connect directly to Member 2's exposed service.
