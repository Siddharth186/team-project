# NEXUS AI — FULL SYSTEM AUDIT
**Date:** October 9, 2026  
**Auditor:** Senior Full-Stack AI System Engineer, Debugger & Architect  
**Branch:** `debug/full-system-audit`  
**Scope:** Complete repository audit of Member 1 (Document Engine), Member 2 (Intelligence Engine), and Member 3 (Orchestration & Frontend).

---

## 1. Current High-Level Architecture

NEXUS AI is designed as a hybrid microservice and deterministic intelligence architecture built around the foundational axiom:
> **"The unit of intelligence is the FACT, not the document."**

```
┌────────────────────────────────────────────────────────┐
│             FRONTEND USER INTERFACE (Vite / React 19)   │
│             Port: 3000 (Proxies /api to 5001)           │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON / REST
                            ▼
┌────────────────────────────────────────────────────────┐
│        MEMBER 3: ORCHESTRATION & REASONING (Node.js)    │
│        Port: 5001 (Express ESM)                        │
│        - Session Dossier Store (In-Memory / State)     │
│        - Grounded Reasoning Engine                     │
│        - Audit Report Generator                        │
│        - Subsystem Coordinator (Member 1 + Member 2)   │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               │ HTTP Ingest              │ HTTP Process Case
               ▼                          ▼
┌──────────────────────────────┐  ┌──────────────────────────────────┐
│ MEMBER 1: DOCUMENT ENGINE    │  │ MEMBER 2: INTELLIGENCE ENGINE    │
│ Port: 8000 (Python FastAPI)  │  │ Port: 3002 (Node.js TypeScript)  │
│ - Ingestion & Magic Bytes    │  │ - Fact & Currency Normalizer     │
│ - Multi-format Parsers       │  │ - Entity Resolution & Disambig   │
│ - OCR (WinRT/Tesseract/Mock) │  │ - Contradiction Detection        │
│ - Semantic Token Chunker     │  │ - Temporal Sequence Analysis     │
│ - Prompt-Guarded Extractor   │  │ - Checklist & Missing Info       │
│ - Autonomous Fallback Parser │  │ - Multi-Signal Confidence        │
│                              │  │ - Source Traceability Cards      │
└──────────────────────────────┘  └──────────────────────────────────┘
```

---

## 2. Frontend Architecture (`frontend/`)

* **Framework:** React 19 (`react: ^19.2.8`, `react-dom: ^19.2.8`) with Vite 8 (`@vitejs/plugin-react`).
* **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), custom glassmorphic styling (`glass-panel-nexus`), and theme variables.
* **Key Components:**
  * `App.tsx`: Root state coordinator. Manages modal visibility, active navigation tabs, dynamic document list, theme switching, and black hole cursor.
  * `Navbar.tsx`: Sticky navigation header with status indicators, search trigger, theme switcher, and navigation pills.
  * `DocumentProcessingPanel.tsx`: Visual ingestion pipeline representation featuring the `NexusHolographicCore`.
  * `DocumentSummary.tsx`: Multimodal document list with live synchronization, format chips, and individual document cards.
  * `ChatBoxTerminal.tsx`: Natural language Q&A terminal with inline "+ Upload Document" button, grounded replies, and citation pills.
  * `RecentIntelligence.tsx`: Critical finding cards with discrepancy highlights, variance bars, and drill-down evidence triggers.
  * `UploadModal.tsx`: Drag-and-drop file uploader supporting multi-format files and demo batches.
  * `EvidenceDrawer.tsx`: Full-screen side drawer rendering comparative source evidence, verbatim quotes, and variance explanations.
  * `KnowledgeGraphModal.tsx` & `TimelineModal.tsx`: Visual modals for relationship networks and temporal sequences.
  * `AntigravityScene.tsx`: Three.js 3D background with floating translucent verified documents and particle constellation.
* **API Client (`frontend/src/services/api.ts`):** Centralized HTTP abstraction querying `/api/*`, forwarded to port 5001 via Vite reverse proxy.

---

## 3. Backend Architecture

### A. Member 3: Orchestrator (`orchestrator/`)
* **Framework:** Express 4 on Node.js (ES Modules).
* **Entrypoint:** `orchestrator/server.js`.
* **State Management:** `sessionData` in-memory ledger storing `documents`, `entities`, `facts`, `findings`, `missingInformation`, `temporalTrajectory`, `graph`, and `metrics`.
* **Services:**
  * `GroundedReasoningEngine`: Implements rule-based, deterministic response generation for queries regarding contradictions, timelines, missing requirements, and evidence citations.
  * `CaseReportGenerator`: Synthesizes full underwriter dossiers with risk scoring, human action checklists, and Markdown export.
  * `Member1Client`: Connects to FastAPI on port 8000; provides autonomous extraction fallback when Python is offline.
  * `Member2Client`: Connects to Member 2 REST API on port 3002 (`POST /api/v1/intelligence/process`).

### B. Member 2: Intelligence Engine (`src/`)
* **Framework:** Node.js v24 native execution (`--experimental-strip-types`), native HTTP server.
* **Entrypoint:** `src/index.ts` $\rightarrow$ `src/api/server.ts`.
* **Submodules:**
  * `normalizers/`: Currency (INR Lakh/Crore, USD, EUR), dates (DD/MM/YYYY, ISO, quarters, fiscal years), numbers, percentages, identifiers.
  * `entity_resolution/`: Token matching, initials matching, disambiguation guards preventing merging across conflicting identifiers (e.g. PAN).
  * `contradiction/`: Invariant attribute comparison, timeframe equality checks, revision vs contradiction filtering.
  * `temporal/`: Chronological sorting, velocity/percentage calculation, natural trajectory summaries.
  * `missing_info/`: Checklist validation for mandatory document types and essential borrower attributes.
  * `confidence/`: Multi-signal weighted confidence formula factoring extraction quality, entity resolution certainty, normalization confidence, source quality, and evidence completeness.
  * `evidence/`: Traceable Evidence Card generator linking Finding $\rightarrow$ Facts $\rightarrow$ Document $\rightarrow$ Page $\rightarrow$ Verbatim Quote.

### C. Member 1: Document Engine (`document_engine/`)
* **Framework:** Python 3.10+ with FastAPI, Pydantic v2, and Uvicorn.
* **Entrypoint:** `document_engine/server.py` (`POST /api/v1/document-intelligence/ingest`).
* **Parsers:** `pdf_parser.py` (PyMuPDF / pypdf), `docx_parser.py`, `spreadsheet_parser.py` (pandas, openpyxl), `text_parser.py`, `image_parser.py`.
* **OCR:** `ocr/manager.py` (Windows Media OCR / Tesseract / Mock fallback).
* **Chunking:** `chunker.py` (token-bounded, sentence-preserving, chunk IDs).
* **LLM Extraction:** `extraction/engine.py` (Gemini, OpenAI, Ollama, Deterministic provider) with prompt injection encapsulation guards (`<DOCUMENT_DATA>`).

---

## 4. Data Flow

1. **Document Intake:** File buffer received $\rightarrow$ SHA-256 hash calculated $\rightarrow$ Format validated.
2. **Text & Table Extraction:** Parser splits document into `PageModel`s $\rightarrow$ Generates `ChunkModel`s with page numbers.
3. **Structured Extraction:** LLM/heuristic extractor identifies `ExtractedEntity` and `ExtractedFact` linked to `SourceEvidence`.
4. **Fact Normalization:** Text values normalized to standard currencies (INR numbers), dates (ISO strings), numbers.
5. **Entity Resolution:** Mentions clustered by canonical entity ID (`PERSON_001`, `ORG_001`).
6. **Contradiction Detection:** Facts compared pairwise on same entity + attribute + timeframe $\rightarrow$ Emits `CONTRADICTION` or `CONSISTENT` findings.
7. **Temporal Analysis:** Chronological progression constructed $\rightarrow$ Emits `TEMPORAL_CHANGE`.
8. **Missing Information:** Compares against required loan verification checklist $\rightarrow$ Emits `MISSING_INFORMATION`.
9. **Confidence Calculation:** Computes composite score $C \in [0, 1]$.
10. **Evidence Synthesis:** Generates evidence cards with exact page numbers and highlighted verbatim quotes.
11. **Grounded Reasoning:** Answers user questions strictly using verified facts and evidence cards.

---

## 5. API Flow

| Route | Method | Subsystem | Purpose |
| :--- | :---: | :---: | :--- |
| `GET /api/status` | GET | Orchestrator (:5001) | Subsystem health, pipeline stages, Member 1 & 2 integration status |
| `GET /api/metrics` | GET | Orchestrator (:5001) | Ingestion and conflict statistics |
| `GET /api/documents` | GET | Orchestrator (:5001) | Ingested document dossier list |
| `POST /api/documents/upload` | POST | Orchestrator (:5001) | Ingests files through Member 1 parser and Member 2 engine |
| `GET /api/documents/progress` | GET | Orchestrator (:5001) | Progress polling for asynchronous processing |
| `DELETE /api/documents/:id` | DELETE | Orchestrator (:5001) | Removes document from active session |
| `GET /api/findings` | GET | Orchestrator (:5001) | Critical and high discrepancy findings |
| `GET /api/timeline` | GET | Orchestrator (:5001) | Chronological financial trajectory |
| `GET /api/graph` | GET | Orchestrator (:5001) | Entity relationship nodes and edges |
| `POST /api/qa` | POST | Orchestrator (:5001) | Grounded natural language Q&A reasoning |
| `GET /api/report` | GET | Orchestrator (:5001) | Full underwriter decision intelligence dossier |
| `GET /api/report/markdown` | GET | Orchestrator (:5001) | Markdown export of audit report |
| `GET /api/v1/health` | GET | Member 2 (:3002) | Subsystem health check |
| `POST /api/v1/intelligence/process` | POST | Member 2 (:3002) | Evaluates case payload and detects contradictions |
| `GET /api/v1/findings` | GET | Member 2 (:3002) | Fetches filtered findings from Member 2 |
| `GET /api/v1/evidence/:id` | GET | Member 2 (:3002) | Generates traceable evidence cards |
| `GET /api/v1/health` | GET | Member 1 (:8000) | Document engine health check |
| `POST /api/v1/document-intelligence/ingest` | POST | Member 1 (:8000) | Ingests file and returns extracted facts & chunks |

---

## 6. LLM Flow

* **Providers Supported:** Google Gemini (`gemini-1.5-flash`), OpenAI (`gpt-4o-mini`), Ollama (`llama3`), and Deterministic Local Extractor.
* **Separation of Concerns:** 
  * AI is used solely for *candidate information extraction*.
  * Calculations, date comparisons, entity disambiguation, and contradiction logic are strictly **deterministic** in Member 2 to guarantee zero hallucinations and legal reproducibility.
* **Prompt Injection Defense:** Document text is passed in `<DOCUMENT_DATA>` tags with explicit system instructions prohibiting execution of text commands.

---

## 7. Database & Persistence Flow

* **Current Architecture:** High-fidelity in-memory state architecture for hackathon demo stability (`sessionData` in Orchestrator and `reportsStore` Map in Member 2).
* **Reset Mechanism:** `POST /api/reset` resets the session store to baseline verification state (`CASE-LOAN-2026-8841`).
* **Document Registry:** Documents are tracked by UUID with checksums and status metadata.

---

## 8. Document Processing Flow

* **Input Formats:** PDF, DOCX, XLSX, CSV, TXT, PNG, JPG.
* **Pipeline:**
  1. File validation (extension & magic bytes).
  2. Text & layout extraction (preserving page boundaries and tabular cell coordinates).
  3. Chunking with overlap (maintaining document ID and page number provenance).
  4. Candidate entity and fact tagging with `SourceEvidence`.

---

## 9. Current Dependencies

### Root & Member 2:
* Node.js v24.19.0.
* Native test runner (`node --test`), native strip types (`--experimental-strip-types`). Zero external runtime dependencies.

### Orchestrator:
* `express`: 4.21.1
* `cors`: 2.8.5
* `dotenv`: 16.4.5

### Frontend:
* `react`: 19.2.8
* `react-dom`: 19.2.8
* `vite`: 8.3.0
* `tailwindcss`: 4.3.3
* `lucide-react`: 1.53.0
* `three`: 0.186.1
* `canvas-confetti`: 1.9.4

### Member 1:
* Python 3.10+ (FastAPI, PyMuPDF, pypdf, python-docx, openpyxl, pandas, google-generativeai, pytesseract).

---

## 10. Environment Variables

* `PORT`: Default 8000 for Member 1, 5001 for Orchestrator.
* `MEMBER1_URL`: Defaults to `http://localhost:8000`.
* `MEMBER2_URL`: Defaults to `http://localhost:3002`.
* `GEMINI_API_KEY`: API key for Google Gemini provider.
* `OCR_PROVIDER`: `auto` / `winrt` / `tesseract` / `mock`.
* `STORAGE_DIR`: `./data/documents`.

---

## 11. Known Failures & Root Causes (Audited)

1. **Upload Disconnection (Resolved in previous turn):**
   * *Problem:* `UploadModal.tsx` was executing simulated timeouts without dispatching HTTP requests.
   * *Root Cause:* Member 3 UI mock handlers were not wired to `nexusApi.uploadDocuments()`.
2. **Member 2 Integration Health Check (Resolved in previous turn):**
   * *Problem:* Orchestrator reported `connected: false` despite Member 2 running.
   * *Root Cause:* Route mismatch (`/health` vs `/api/v1/health`).
3. **Python Environment on Target Machine:**
   * *Problem:* Target Windows workstation does not have Python in global PATH.
   * *Root Cause:* System configuration gap.
   * *Mitigation:* Member 3 `Member1Client` includes an autonomous multi-format parser fallback that extracts structured facts and entities directly.
4. **Scrolling Artifact:**
   * *Problem:* Black line visible while scrolling.
   * *Root Cause:* Scrollbar track background `#0D0F0E` and Three.js floor `GridHelper` rendered visible horizontal/vertical lines.

---

## 12. Suspicious Code & Integration Risks

1. **Port Collisions via Root `.env`:**
   * Root `.env` sets `PORT=8000`. If `dotenv.config()` is called in `orchestrator/server.js` without overriding `PORT`, the orchestrator binds to 8000 instead of 5001.
   * *Fix:* Orchestrator explicitly checks `process.env.ORCHESTRATOR_PORT || (process.env.PORT === '8000' ? 5001 : process.env.PORT) || 5001`.
2. **Large File Upload Limits:**
   * Express default JSON body limit is 100KB. Large base64 files exceed this limit without `{ limit: '50mb' }`.
3. **Entity Name Inconsistencies:**
   * Member 1 extracted entity names may differ slightly from canonical names. Member 2's fuzzy and initial token matching (`R. Kumar` $\leftrightarrow$ `Ramesh Kumar`) must be active on newly ingested facts.

---

## 13. Recommended Fixes

1. Enforce dedicated default port fallbacks in code so missing environment variables never cause port conflicts.
2. Ensure all newly uploaded documents immediately register in `sessionData.documents`, trigger Member 2 contradiction checks, and refresh the UI state.
3. Validate that Q&A queries against newly uploaded facts cite their corresponding document and page number.
