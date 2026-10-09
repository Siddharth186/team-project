# NEXUS AI — COMPLETE FORENSIC ARCHITECTURE SPECIFICATION
**Version:** 3.0.0 (Forensic Audit & Multi-Engine Integration)  
**Date:** October 9, 2026  
**Auditor:** Senior Forensic Systems Engineer & AI Architect  

---

## 1. System Map & Core Subsystems

```
+------------------------------------------------------------------------------------+
|                                     USER INTERFACE                                 |
|                 React 18 + Vite + Tailwind CSS + Lucide Icons (Port 3000)          |
|  - Upload Modal (FileReader binary + JSON multipart payload dispatch)             |
|  - Overview / Dashboard / Contradictions / Timeline / Copilot Chat Panels         |
+------------------------------------------------------------------------------------+
                                           |
                                  REST API / JSON Proxy
                                           v
+------------------------------------------------------------------------------------+
|                             MEMBER 3: ORCHESTRATION LAYER                          |
|                             Express 5 / Node.js (Port 5001)                        |
|  - Storage Manager: Physical disk archive (`data/documents/`) + Durable JSON state |
|  - Reasoning Engine: Grounded RAG with strict anti-hallucination verification      |
|  - Member 1 Client Adapter: FastAPI bridge + Multimodal Vision OCR + Regex parser  |
|  - Member 2 Client Adapter: IngestedCasePayload dispatcher + Contradiction sync    |
+------------------------------------------------------------------------------------+
             |                                                  |
    Internal HTTP / Fallback                           Internal HTTP
             v                                                  v
+-----------------------------------------+    +------------------------------------+
|      MEMBER 1: INGESTION PIPELINE       |    |   MEMBER 2: INTELLIGENCE ENGINE    |
|   FastAPI / Python (Port 8000) & Node   |    |    Node.js / TypeScript (Port 3002)|
| - PDF, DOCX, XLSX, CSV, TXT Parser      |    | - Entity Resolution (Fuzzy Match)  |
| - Gemini 3.5 Flash Vision OCR Engine    |    | - Fact Normalization & Clustering  |
| - Dynamic Key-Value & Regex Extractor   |    | - Contradiction Detection Engine   |
| - Source Bounding Page/Quote Coordinate |    | - Missing Info Compliance Auditor  |
+-----------------------------------------+    | - Temporal Trajectory Analyzer     |
                                               | - Evidence Citation Engine         |
                                               +------------------------------------+
```

---

## 2. Forensic Component Inventory & Responsibilities

| Component | Technology | Primary Location | Responsibility |
|---|---|---|---|
| **Frontend UI** | React 18, Vite, Tailwind CSS | `frontend/src` | User interface, file drag-and-drop, dashboard telemetry, terminal chat. |
| **Ingestion Engine (Member 1)** | FastAPI / Gemini 3.5 Flash / Node | `orchestrator/services/member1-client.js` & `document_engine/` | Multimodal OCR, layout analysis, entity and fact extraction from raw files. |
| **Intelligence Engine (Member 2)** | TypeScript / Node.js | `src/` (listening on `:3002`) | Entity resolution, fact normalization, contradiction detection, missing info auditing, temporal timelines. |
| **Orchestrator (Member 3)** | Node.js Express 5 | `orchestrator/server.js` (port `:5001`) | Durable session persistence, API routing, physical disk archive, grounded Q&A reasoning. |
| **Storage Subsystem** | Disk + JSON Atomic Database | `data/documents/` & `orchestrator/data/session-store.json` | Persistent document storage and case state survival across reboots. |

---

## 3. Data Flow & Integration Contracts

### Step 1: Upload & Physical Ingestion
- **Frontend** reads file via `FileReader` and dispatches `POST /api/documents/upload` with `{ documents: [{ name, size, type, content, category }] }`.
- **Orchestrator** writes raw file to `data/documents/<filename>` and passes payload to `member1Client.ingestDocument()`.

### Step 2: Extraction & OCR
- If image/PDF or scanned payload, **Gemini 3.5 Flash Vision OCR** transcribes text and extracts structured entities (`rawEntities`) and atomic facts (`rawFacts`) with verbatim quotes.
- If offline, **Dynamic Key-Value & Regex Extractor** extracts fields (`Name:`, `Monthly Income:`, `Company:`, `Age:`, etc.).

### Step 3: Member 2 Intelligence Processing
- Orchestrator constructs `IngestedCasePayload` and POSTs to `http://localhost:3002/api/cases/process`.
- Member 2 executes:
  1. `EntityResolver.resolveEntities()` (fuzzy matching syntactic aliases e.g. "Rahul Sharma" & "R. Sharma").
  2. `FactLinker.linkFacts()` & normalizes currency/numbers/dates.
  3. `ContradictionEngine.analyzeClusters()` (detects value variances e.g. ₹50,000 vs ₹35,000).
  4. `MissingInfoEngine.evaluateMissingInformation()`.
  5. `TemporalEngine.buildTimelines()`.

### Step 4: Storage & Durable State
- Orchestrator merges output into `sessionData`, calls `StorageManager.saveSession()`, and serializes to disk.

### Step 5: Grounded Q&A Reasoning
- `POST /api/qa` routes to `GroundedReasoningEngine.answerQuestion()`.
- Grounded against active case facts and documents.
- Strict anti-hallucination guardrail: Returns explicit *"not available"* notice for absent fields (e.g. blood group).
