# NEXUS AI — MASTER PROJECT MAP & SUBSYSTEM BLUEPRINT
**Date:** October 9, 2026  
**System Architecture:** 3-Member Unified Intelligence Architecture  

---

## 1. System Topology & Architecture

NEXUS AI is structured into three specialized subsystems communicating over standard HTTP REST contracts:

```
[ FRONTEND UI ] (Port 3000)
      │
      │ HTTP REST
      ▼
[ MEMBER 3: ORCHESTRATOR SERVER ] (Port 5001)
      │                                     │
      │ Ingestion Request                   │ Pipeline Payload
      ▼                                     ▼
[ MEMBER 1: INGESTION PIPELINE ]     [ MEMBER 2: INTELLIGENCE ENGINE ]
  (FastAPI / Gemini Vision OCR)         (TypeScript HTTP Server - Port 3002)
  - Multimodal OCR & Parsing           - Entity Resolution
  - Text Extraction & Chunking         - Fact Normalization & Clustering
  - Entity & Fact Model Mapping        - Cross-Document Contradiction Engine
                                       - Missing Information Evaluator
                                       - Temporal Trajectory Analyzer
                                       - Multi-Signal Evidence Engine
```

---

## 2. Component Inventory & Responsibilities

### Member 1: Document Processing & Ingestion
- **Location:** `orchestrator/services/member1-client.js` & `document_engine/`
- **Supported Formats:** PDF, DOCX, XLSX, CSV, TXT, PNG, JPEG, WEBP.
- **Engines:**
  1. *Gemini 3.5 Flash Multimodal Vision OCR:* Directly handles scanned PDFs, images, and binary documents without requiring native Python or Tesseract dependencies.
  2. *Dynamic Key-Value & Regex Parser:* Provides autonomous heuristic extraction of key entity lines (`Name:`, `Company:`, `Monthly Income:`, `Age:`, `Date:`, `City:`).
  3. *FastAPI Bridge (`:8000`):* Connects to live Python ingestion service when available.

### Member 2: Intelligence & Contradiction Engine
- **Location:** `src/` (listening on Port 3002 via `src/api/server.ts`)
- **Key Modules:**
  1. `src/entity_resolution/entity_resolver.ts`: Discovers cross-document aliases using fuzzy string matching and multi-signal clustering (e.g., merging "Rahul Sharma" and "R. Sharma").
  2. `src/normalization/`: Canonicalizes currency (`₹`, `INR`), numbers, and ISO dates.
  3. `src/fact_linking/fact_linker.ts`: Groups assertions by `(entity_id, attribute)` clusters.
  4. `src/contradiction/contradiction_engine.ts`: Compares clustered fact values across documents to detect invariant clashes and numeric discrepancies (e.g. ₹50k vs ₹35k).
  5. `src/missing_info/missing_info_engine.ts`: Evaluates checklist compliance and required disclosures.
  6. `src/temporal/temporal_engine.ts`: Reconstructs chronological trajectories across dates.

### Member 3: Orchestrator, Storage & UI
- **Location:** `orchestrator/server.js` (Port 5001) & `frontend/` (Port 3000)
- **Key Modules:**
  1. `orchestrator/services/storage-manager.js`: Durable JSON case persistence targeting `orchestrator/data/session-store.json` and physical file archive in `data/documents/`.
  2. `orchestrator/services/reasoning-engine.js`: Grounded Q&A engine with strict anti-hallucination verification.
  3. `frontend/src/components/modals/UploadModal.tsx`: Binary file reader with live upload dispatch.
  4. `frontend/src/components/chat/ChatBoxTerminal.tsx`: Interactive Copilot terminal connected to live reasoning.

---

## 3. End-to-End Execution Flow

```
1. USER SELECTION:
   User selects or drops files in Frontend UI.

2. UPLOAD & PERSISTENCE:
   Frontend dispatches `POST /api/documents/upload`.
   Orchestrator writes physical copy to `data/documents/<filename>`.

3. PARSING & EXTRACTION (Member 1):
   `Member1Client` parses text/images via Gemini Vision OCR into structured `rawEntities` and `rawFacts`.

4. INTELLIGENCE REASONING (Member 2):
   Orchestrator sends payload to `http://localhost:3002/api/cases/process`.
   Member 2 resolves entities, clusters facts, detects discrepancies, and builds timelines.

5. DURABLE STORAGE:
   Orchestrator merges intelligence report into `sessionData` and saves to `session-store.json`.

6. GROUNDED Q&A:
   User questions to `POST /api/qa` retrieve facts from active case storage and produce cited, hallucination-free answers.
```
