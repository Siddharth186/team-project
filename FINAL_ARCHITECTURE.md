# NEXUS AI — FINAL ARCHITECTURE SPECIFICATION
**Version:** 2.0.0 (Unified Master Integration)  
**Date:** October 9, 2026  
**Status:** FULLY INTEGRATED & VERIFIED  

---

## 1. Architectural Philosophy

> **"The unit of intelligence is the FACT, not the document."**

NEXUS AI transitions document intelligence from basic conversational RAG to **Evidence-Centric Information Intelligence**. Rather than feeding raw text into generic LLM context windows, NEXUS AI decomposes heterogeneous files into atomic, verifiable facts, maps entity relationships, normalizes assertions, detects semantic and temporal contradictions, identifies missing critical information, and exposes verifiable citations down to page and character chunks.

```
+-----------------------------------------------------------------------------------+
|                                  USER / BROWSER                                   |
|               React 18 + Vite + Tailwind CSS + Lucide Icons (Port 3000)           |
+-----------------------------------------------------------------------------------+
                                      |
                            REST API / JSON
                                      v
+-----------------------------------------------------------------------------------+
|                           MEMBER 3: ORCHESTRATOR API                              |
|                           Express 5 / Node.js (Port 5001)                         |
|  - Ingestion Coordinator (Member 1 adapter + Auto-Parser fallback)                |
|  - Intelligence Pipeline Coordinator (Member 2 client adapter)                    |
|  - Live SSE / State Repository / Verification Auditor                             |
+-----------------------------------------------------------------------------------+
         |                                                           |
         | Internal HTTP                                             | Internal HTTP
         v                                                           v
+-----------------------------------------+       +---------------------------------+
|          MEMBER 1: INGESTION            |       |  MEMBER 2: INTELLIGENCE ENGINE  |
|  FastAPI / Python (Port 8000)           |       |  Node.js / TypeScript (Port 3002)|
|  - OCR & Vision Pipeline                |       |  - Fact Normalizer              |
|  - PDF / DOCX / XLSX / CSV / TXT Parser |       |  - Entity Resolution Engine     |
|  - Resilient Auto-Parser Fallback       |       |  - Cross-Doc Contradiction Det. |
|    (Embedded in Member 1 Client)        |       |  - Missing Info Analyzer        |
+-----------------------------------------+       |  - Temporal Timeline Tracker    |
                                                  |  - Evidence Citation Verifier   |
                                                  |  - Gemini 2.5 Flash Reasoning   |
                                                  +---------------------------------+
```

---

## 2. Core Subsystems

### Member 1: Document Understanding & Ingestion Pipeline
- **Primary Runtime:** FastAPI (`app/main.py`) running on Port 8000.
- **Resilience Layer:** `Member1Client` (`orchestrator/services/member1-client.js`).
  - Automatically queries `http://localhost:8000/health`.
  - When Python runtime or external OCR dependencies are active, routes extraction to FastAPI.
  - When FastAPI is unavailable (or Python is absent on the host), executes **Deterministic Autonomous Parsing** extracting text, metadata, page numbers, chunks, and regex-driven domain entities (PAN, financial figures, dates, parties, IDs).
- **Supported Formats:** PDF, DOCX, XLSX, CSV, TXT, MD, JSON.

### Member 2: Intelligence, Verification & Reasoning Engine
- **Primary Runtime:** TypeScript HTTP Service (`src/index.ts` / `src/api/server.ts`) running on Port 3002.
- **Engines:**
  1. **Fact Normalizer (`src/core/fact-normalization.ts`):** Canonicalizes date formats, currency units, entity identifiers, and quantitative values.
  2. **Entity Resolution (`src/core/entity-resolution.ts`):** Merges syntactic aliases and cross-document references into unified global entity nodes.
  3. **Contradiction Detector (`src/core/contradiction-detection.ts`):** Performs pairwise fact comparison across documents detecting direct value discrepancies, negation conflicts, and date clashes with confidence scoring.
  4. **Missing Information Engine (`src/core/missing-info.ts`):** Evaluates case schemas against regulatory/compliance checklists to identify missing required disclosures.
  5. **Temporal Analyzer (`src/core/temporal-analyzer.ts`):** Reconstructs chronological event streams and audits state changes over time.
  6. **LLM Reasoning Engine (`src/llm/gemini.ts`):** Powered by `gemini-2.5-flash` with strict evidence grounding rules.

### Member 3: Unified Orchestrator & Frontend UI
- **Backend Orchestrator:** Express.js (`orchestrator/server.js`) on Port 5001.
  - Ingestion buffer configured for large payloads (`express.json({ limit: '50mb' })`).
  - Exposes unified REST endpoints (`/api/documents`, `/api/intelligence/pipeline`, `/api/chat`, `/api/analysis`).
  - Guarantees live multi-document processing and state persistence.
- **Frontend Application:** Vite + React (`frontend/src`) on Port 3000.
  - Interactive multi-file drag-and-drop file ingestion via `FileReader`.
  - Real-time Intelligence Dashboard (Documents, Facts, Contradictions, Missing Info, Timeline).
  - Terminal-style Copilot Chat connected to live backend LLM reasoning.
  - Visual 3D antigravity background canvas with responsive UI cards.

---

## 3. End-to-End Pipeline Contract

```
[File Upload]
      | (Base64 / Multipart)
      v
POST /api/documents/upload (Port 5001)
      |
      +---> Member 1 Extraction (Port 8000 / Auto-Parser)
      |         Output: { documents: [ { id, name, content, chunks, entities, facts } ] }
      |
      +---> Member 2 Intelligence Engine (POST http://localhost:3002/api/cases/process)
      |         Payload: { caseId, documents, facts }
      |         Output: {
      |             caseId,
      |             facts: [...],
      |             entities: [...],
      |             contradictions: [...],
      |             missingInfo: [...],
      |             timeline: [...],
      |             summary: "...",
      |             evidence: [...]
      |         }
      |
      v
[Unified State Update]
      |
      +---> UI Dashboard Tabs Updated (Overview, Documents, Contradictions, Timeline, Q&A)
      +---> Copilot Terminal Armed with Evidence Context
```

---

## 4. Port & Configuration Topology

| Service | Port | Route Mapping | Health Check |
|---|---|---|---|
| Frontend Web UI | 3000 | `http://localhost:3000` | HTTP 200 GET `/` |
| Member 2 Intelligence API | 3002 | `http://localhost:3002/api/*` | HTTP 200 GET `/health` |
| Member 3 Orchestrator API | 5001 | `http://localhost:5001/api/*` | HTTP 200 GET `/health` |
| Member 1 FastAPI Ingestion | 8000 | `http://localhost:8000/api/*` | HTTP 200 GET `/health` (or internal auto-fallback) |

---

## 5. Security & Verifiability Guarantees

1. **Zero Secret Leakage:** All API keys remain isolated in `.env` and are never serialized to frontend bundles or client logs.
2. **Grounding & Traceability:** Every contradiction and timeline assertion carries a direct reference to source `document_id`, `chunk_id`, and `exact_quote`.
3. **Graceful Fallbacks:** The system functions reliably whether offline or online, scaling from local deterministic heuristics to full cloud LLM reasoning seamlessly.

---

## 6. Resolved Architectural Enhancements

### 1. Multimodal Gemini 3.5 Flash Vision OCR (Zero Host Dependency)
- **Problem Solved:** Environments lacking native Python/Tesseract runtimes could not execute optical OCR on scanned images or visual documents.
- **Implementation:** `Member1Client` (`orchestrator/services/member1-client.js`) embeds direct Google Gemini 3.5 Flash Vision OCR. Scanned documents, PNG, JPEG, and WEBP files are analyzed multimodal-first, extracting high-fidelity transcripts, structured entities, and atomic facts with verbatim source evidence.
- **Failover:** If network access to the Gemini API is unavailable, the system automatically falls back to the deterministic parsing engine without process crashes.

### 2. Durable Persistent Session Storage
- **Problem Solved:** Case state was previously held purely in volatile process RAM; server reboots reset the session.
- **Implementation:** Built `StorageManager` (`orchestrator/services/storage-manager.js`) which serializes and persists case state to `orchestrator/data/session-store.json`.
- **Durability:** Server reboots cleanly re-hydrate all previously uploaded documents, normalized facts, resolved entities, and detected contradictions. Added `/api/session/stats` and `/api/session/reset` administrative controls.

