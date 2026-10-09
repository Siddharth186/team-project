# NEXUS AI — DATA FLOW AUDIT
**Date:** October 9, 2026  
**Document Traced:** `ITR_V_Assessment_Year_2025_26.pdf` (Multi-Page Income Tax Return)  
**Scenario:** Borrower Loan Dossier Cross-Verification  

---

## 1. Complete Stage-by-Stage Trace

```
USER
 ↓ (1) Selects file in UploadModal
FRONTEND UI
 ↓ (2) FileReader parses file & dispatches nexusApi.uploadDocuments()
UPLOAD API
 ↓ (3) POST /api/documents/upload to Orchestrator (:5001)
FILE STORAGE & INGESTION
 ↓ (4) Member 1 Ingestion Manager validates magic bytes & SHA-256 hash
PARSER & OCR
 ↓ (5) PyMuPDF / Windows OCR extracts text, tables & page boundaries
TEXT & CHUNKS
 ↓ (6) Chunker generates token-bounded ChunkModels with page numbers
LLM / DETERMINISTIC EXTRACTION
 ↓ (7) Extractor identifies candidate entities, facts, and SourceEvidence quotes
STRUCTURED FACTS & ENTITIES
 ↓ (8) Member 1 builds ExtractedFact & ExtractedEntity models
NORMALIZATION & RESOLUTION
 ↓ (9) Member 2 normalizes INR currency, dates, and resolves entity tokens
FACT COMPARISON & CONTRADICTION DETECTION
 ↓ (10) Pairwise comparison on (Entity × Attribute × Timeframe) detects mismatch
MISSING INFORMATION & TEMPORAL ANALYSIS
 ↓ (11) Checklist evaluation + Chronological trajectory generation
EVIDENCE & CONFIDENCE SCORING
 ↓ (12) Generates traceable Evidence Cards + Multi-signal confidence calculation
FINDINGS & REASONING SYNTHESIS
 ↓ (13) Orchestrator synthesizes findings and updates session dossier
Q&A & DECISION REPORT
 ↓ (14) Grounded Q&A answers queries with verbatim page citations
FRONTEND DISPLAY
 ↓ (15) Renders interactive finding cards, 3D dossier, and underwriter report
USER
```

---

## 2. Stage-by-Stage Technical Specifications

### Stage 1: User File Selection
* **Input:** User drags and drops `ITR_V_Assessment_Year_2025_26.pdf` into browser.
* **Output:** DOM `File` object (`name: "ITR_V_Assessment_Year_2025_26.pdf"`, `size: 980300`, `type: "application/pdf"`).
* **Module:** `frontend/src/components/modals/UploadModal.tsx` (`handleFiles`).
* **Endpoint:** N/A (Client-side).
* **Schema:** Browser `FileList` / `File`.
* **Database:** N/A.
* **Failure Conditions:** Unsupported file extension, zero-byte file, browser file access permission denial.

### Stage 2: Frontend Processing & API Dispatch
* **Input:** `File` object from file input or drag-and-drop.
* **Output:** JSON payload with file metadata and text content: `{ files: [{ name, size, type, content }] }`.
* **Module:** `frontend/src/services/api.ts` (`nexusApi.uploadDocuments`).
* **Endpoint:** `POST /api/documents/upload`.
* **Schema:** `Array<{ name: string; size?: number; type?: string; category?: string; content?: string }>`.
* **Database:** N/A.
* **Failure Conditions:** Network timeout, payload exceeds browser memory, reverse proxy connection failure.

### Stage 3: Orchestrator Ingestion Endpoint
* **Input:** HTTP `POST` body with JSON array of documents.
* **Output:** Ingestion acceptance response with newly created document records.
* **Module:** `orchestrator/server.js` (`app.post('/api/documents/upload')`).
* **Endpoint:** `POST /api/documents/upload`.
* **Schema:** Express `Request.body` with `files` array.
* **Database:** Pushes to in-memory `sessionData.documents`.
* **Failure Conditions:** Express JSON body limit exceeded (fixed via 50MB limit), invalid JSON format.

### Stage 4: File Storage & Verification
* **Input:** Raw file buffer and filename.
* **Output:** Validated file metadata (`document_id`, `sha256_hash`, `file_type`, `status: "PENDING"`).
* **Module:** `document_engine/ingestion/manager.py` (or `Member1Client`).
* **Endpoint:** `POST /api/v1/document-intelligence/ingest`.
* **Schema:** `DocumentModel` (Pydantic).
* **Database:** Document registry in memory / disk storage directory.
* **Failure Conditions:** File hash already exists (duplicate document), corrupt file header.

### Stage 5: Parsing & OCR
* **Input:** Raw document bytes.
* **Output:** Array of `PageModel` objects with text, cell coordinates, and page numbers.
* **Module:** `document_engine/parsers/pdf_parser.py` with fallback to `ocr/manager.py`.
* **Endpoint:** Internal engine call (`parser.parse_bytes`).
* **Schema:** `List[PageModel]`.
* **Database:** Cached in document intelligence store.
* **Failure Conditions:** Password-protected PDF, blurry scan below OCR character threshold (handled by fallback OCR).

### Stage 6: Semantic Chunking
* **Input:** Pages with extracted text.
* **Output:** Bounded-token `ChunkModel` objects (max 500 tokens, 50-token overlap) preserving sentence boundaries.
* **Module:** `document_engine/chunking/chunker.py`.
* **Endpoint:** Internal engine call (`chunker.chunk_pages`).
* **Schema:** `List[ChunkModel]` with `chunk_id`, `page_number`, `document_id`.
* **Database:** N/A.
* **Failure Conditions:** Zero-length text after extraction, tokenizer token limit exceptions.

### Stage 7: LLM / Heuristic Extraction
* **Input:** `ChunkModel` encapsulated in `<DOCUMENT_DATA>` tags with extraction prompt.
* **Output:** Extracted candidate entities, facts, and verbatim quotes.
* **Module:** `document_engine/extraction/engine.py` / `orchestrator/services/member1-client.py`.
* **Endpoint:** `POST /api/v1/extract` (or internal engine pipeline).
* **Schema:** `ChunkExtractionOutput` (Pydantic).
* **Database:** N/A.
* **Failure Conditions:** LLM rate limit (429), API key invalid/expired, prompt injection attempt in source text (prevented by `<DOCUMENT_DATA>` guard).

### Stage 8: Structured Fact & Entity Models
* **Input:** Validated extraction JSON.
* **Output:** `ExtractedFact` and `ExtractedEntity` lists with `SourceEvidence`.
* **Module:** `document_engine/schemas/extraction.py`.
* **Endpoint:** `POST /api/v1/document-intelligence/ingest` response.
* **Schema:** `DocumentIntelligenceResponse`.
* **Database:** Ingested into document registry.
* **Failure Conditions:** Pydantic schema validation failure (handled by regex sanitizer).

### Stage 9: Normalization & Entity Resolution
* **Input:** `IngestedCasePayload` containing `raw_entities` and `raw_facts`.
* **Output:** Normalized facts with typed numeric currencies and canonical entity IDs (`ORG_001`, `PERSON_001`).
* **Module:** `src/normalizers/` and `src/entity_resolution/`.
* **Endpoint:** `POST /api/v1/intelligence/process` on Member 2 (:3002).
* **Schema:** `IngestedCasePayload` $\rightarrow$ `Fact` array and `ResolvedEntity` array.
* **Database:** Member 2 in-memory cache (`reportsStore`).
* **Failure Conditions:** Unrecognized currency format, contradictory identifier (PAN mismatch prevents merge).

### Stage 10: Fact Comparison & Contradiction Detection
* **Input:** Clustered facts grouped by `(entity_id, canonical_attribute)`.
* **Output:** List of `Finding` items (`CONTRADICTION`, `CONSISTENT`, `DUPLICATE`).
* **Module:** `src/contradiction/contradiction_engine.ts`.
* **Endpoint:** Internal Member 2 pipeline execution.
* **Schema:** `Finding[]` with `severity`, `conflictingFacts`, and `discrepancyDelta`.
* **Database:** N/A.
* **Failure Conditions:** Missing temporal context (flagged as `POSSIBLE_CONTRADICTION`).

### Stage 11: Missing Information & Temporal Analysis
* **Input:** Extracted facts vs mandatory loan checklist + chronological events.
* **Output:** `missing_information` checklist + `timelines` progression.
* **Module:** `src/missing_info/missing_info_engine.ts` & `src/temporal/temporal_engine.ts`.
* **Endpoint:** Internal Member 2 pipeline execution.
* **Schema:** `MissingInfoItem[]` and `EntityTimeline[]`.
* **Database:** N/A.
* **Failure Conditions:** Incomplete date stamps (falls back to YEAR/UNSPECIFIED granularity).

### Stage 12: Evidence & Confidence Scoring
* **Input:** Findings and conflicting facts.
* **Output:** Composite confidence score $C \in [0, 1]$ and `EvidenceCard` with verbatim highlighted text.
* **Module:** `src/confidence/confidence_engine.ts` & `src/evidence/evidence_engine.ts`.
* **Endpoint:** `GET /api/v1/evidence/:finding_id`.
* **Schema:** `ConfidenceAssessment` and `EvidenceCard`.
* **Database:** Stored in Member 2 `reportsStore`.
* **Failure Conditions:** Degraded evidence quality (lowers confidence score below threshold).

### Stage 13: Reasoning & Dossier Synthesis
* **Input:** Processed findings, facts, and documents.
* **Output:** Consolidated session metrics, knowledge graph, and `REVIEW_REQUIRED` audit verdict.
* **Module:** `orchestrator/services/reasoning-engine.js` & `report-generator.js`.
* **Endpoint:** `GET /api/status`, `GET /api/findings`, `GET /api/report`.
* **Schema:** `CaseDecisionReport`.
* **Database:** Updated `sessionData` in Orchestrator.
* **Failure Conditions:** Missing mandatory documents increases risk score.

### Stage 14: Grounded Q&A Execution
* **Input:** Natural language query (e.g. *"What is the gross turnover in the tax return?"*).
* **Output:** Grounded answer with verbatim citations, document names, and page numbers.
* **Module:** `orchestrator/services/reasoning-engine.js` (`answerQuery`).
* **Endpoint:** `POST /api/qa`.
* **Schema:** `QAResponse` (`{ answer, confidence, citedFacts, citedEvidence }`).
* **Database:** Reads from `sessionData`.
* **Failure Conditions:** Unindexed fact triggers honest *"No verified evidence found in dossier"* response (zero hallucination).

### Stage 15: Frontend Presentation to User
* **Input:** JSON response from `/api/*`.
* **Output:** Interactive visual components rendered in browser:
  * Document added to Document Summary and Ingestion Pipeline.
  * Discrepancies highlighted in Recent Intelligence cards.
  * Evidence drawer displays side-by-side excerpts.
  * Chat terminal renders grounded response with clickable citation pills.
* **Module:** `frontend/src/components/`.
* **Endpoint:** Client-side React rendering.
* **Schema:** TypeScript `nexus.ts` models.
* **Database:** Browser DOM.
* **Failure Conditions:** React component rendering error.
