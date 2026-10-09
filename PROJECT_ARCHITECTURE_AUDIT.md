# NEXUS AI — PROJECT ARCHITECTURE AUDIT & COMPLIANCE
**Version:** 3.0.0  
**Audit Date:** October 9, 2026  
**Auditor:** Senior Forensic Systems Engineer & AI Architect  

---

## 1. Subsystems & Component Map

| Layer | Subsystem | Technology | Port / Location | Runtime Role |
|---|---|---|---|---|
| **Presentation** | Frontend Web App | React 18, Vite, Tailwind CSS | `:3000` / `frontend/` | Multi-document upload, live status poller, intelligence dashboard, terminal chat. |
| **Ingestion** | Member 1 Engine | FastAPI / Gemini 3.5 Flash / Node | `:8000` / `orchestrator/services/member1-client.js` | Multimodal Vision OCR, document parsing (PDF, DOCX, XLSX, TXT, CSV, PNG), chunking, fact/entity extraction. |
| **Intelligence** | Member 2 Engine | TypeScript / Express | `:3002` / `src/` | Fuzzy Entity Resolution, Fact Normalization & Clustering, Contradiction Engine, Missing Info Auditing, Temporal Trajectory Tracker. |
| **Orchestrator** | Member 3 Engine | Express 5 / Node.js | `:5001` / `orchestrator/server.js` | Durable JSON persistence (`session-store.json`), physical storage (`data/documents/`), grounded Q&A reasoning. |

---

## 2. NEXUS Pipeline Stage Comparison & Compliance

| Stage | Implemented | Actually Called | Input | Output | Storage | Next Stage | Status |
|---|:---:|:---:|---|---|---|---|:---:|
| **User Upload** | YES | YES | File drag-and-drop | Base64 / multipart payload | Frontend state | Upload API | **PASS** |
| **File Storage** | YES | YES | Upload payload | Physical file on disk | `data/documents/<filename>` | Parser | **PASS** |
| **File Type Detection** | YES | YES | Filename extension / MIME | Extension tag (`pdf`, `txt`, `png`) | Memory / metadata | Ingestion Engine | **PASS** |
| **Document Parser** | YES | YES | File content string/buffer | Clean text & metadata | Memory | Chunking & LLM | **PASS** |
| **OCR (Vision)** | YES | YES | Base64 image/PDF buffer | Transcribed text & bounding coordinates | Memory / facts | Extraction | **PASS** |
| **Text Extraction** | YES | YES | Document bytes | Clean Unicode text stream | Memory | LLM / Heuristics | **PASS** |
| **Chunking** | YES | YES | Extracted text stream | Bounded text segments + coordinates | Memory / facts | LLM Extraction | **PASS** |
| **LLM Processing** | YES | YES | Chunked text + extraction prompt | Structured JSON entities & facts | Memory | Fact Linker | **PASS** |
| **Structured Facts** | YES | YES | LLM response | `rawFacts` with source quote & page | Memory | Member 2 | **PASS** |
| **Entities** | YES | YES | LLM response | `rawEntities` with type & identifiers | Memory | Member 2 | **PASS** |
| **Normalization** | YES | YES | `rawFacts` | Canonical currency, numbers, dates | Memory / JSON | Contradiction Engine | **PASS** |
| **Persistent Storage**| YES | YES | Ingested case state | JSON archive | `orchestrator/data/session-store.json` | Reasoning Engine | **PASS** |
| **Entity Resolution**| YES | YES | `rawEntities` | Merged global entity clusters | Memory / Graph | Contradiction Engine | **PASS** |
| **Contradictions** | YES | YES | Clustered facts | Discrepancy findings & delta | `sessionData.findings` | Decision Dossier / Q&A | **PASS** |
| **Missing Info** | YES | YES | Facts + Document schema | Checklist compliance findings | `sessionData.missingInformation` | Report / UI | **PASS** |
| **Temporal Trajectory**| YES | YES | Chronological facts | Ordered state progression events | `sessionData.temporalTrajectory` | Timeline UI | **PASS** |
| **Evidence Engine** | YES | YES | Finding / fact references | Verbatim quotes & page numbers | `fact.source` / `evidence` | Q&A / Dashboard | **PASS** |
| **Retrieval** | YES | YES | User natural language query | Matching facts, findings, evidence | Reasoning Context | LLM Q&A | **PASS** |
| **Q&A Reasoning** | YES | YES | Query + Grounded facts context | Cited, anti-hallucinated answer | Response JSON | Copilot UI | **PASS** |
| **Frontend UI** | YES | YES | Server API responses | Interactive cards, graphs, chat | Browser DOM | User | **PASS** |
