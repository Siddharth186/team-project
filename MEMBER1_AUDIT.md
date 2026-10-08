# NEXUS AI — Member 1 Repository Audit

## 1. Executive Summary & Repository Assessment
- **Repository State**: Fresh repository initialized with minimal boilerplate (`README.md`). No existing backend codebase, document parsers, or API endpoints exist yet.
- **Assigned Subsystem**: Member 1 — Document Intelligence Engine.
- **Ownership Scope**:
  `RAW DOCUMENTS → INGESTION → PARSING → OCR → NORMALIZATION → CHUNKING → AI EXTRACTION → STRUCTURED INFORMATION → MEMBER 2`
- **Isolation Principle**: All document processing, normalization, and extraction logic is strictly isolated inside `/document_engine` and accessible via standardized REST API endpoints and Python schemas. No cross-document entity deduplication or contradiction analysis (Member 2's domain) or user reporting / Q&A interface (Member 3's domain) is implemented here.

---

## 2. Existing Architecture & Relevant Modules
- **Current Files**:
  - `README.md`
  - `.git/` repository structure on branch `feature/member1-document-engine`
- **Runtime Environment**:
  - Python 3.10.11 (Windows 64-bit)
  - Pre-installed packages: `fastapi`, `pydantic` (v2), `uvicorn`, `pandas`, `pillow`, `google-genai`, `google-generativeai`, `httpx`, `aiohttp`, `python-dotenv`, `winrt-Windows.Media.Ocr`, `pymupdf`, `pypdf`, `python-docx`, `openpyxl`.
- **Conflicts**: None detected. Clean slate allows establishing clean contracts and non-breaking boundaries.

---

## 3. Reusable Components & Libraries
| Component | Library / Engine | Purpose |
|---|---|---|
| **PDF Parsing** | `pymupdf` (PyMuPDF) + `pypdf` fallback | High-speed digital text, metadata, page rendering & table bounding box extraction |
| **DOCX Parsing** | `python-docx` | Structured paragraph, heading, and table extraction |
| **XLSX & CSV** | `openpyxl` & `pandas` | Multi-sheet tabular parsing, column headers, cell grid serialization |
| **Image & OCR** | `winrt-Windows.Media.Ocr` + `pytesseract` + Mock OCR fallback | Zero-cost, high-speed Windows native OCR for scanned documents/images |
| **Data Validation** | `pydantic` (v2) | Strict schema enforcement for Documents, Pages, Chunks, Entities, Facts, and Evidence |
| **LLM Orchestration** | Gemini API (`google-genai`), OpenAI-compatible, Ollama, and Deterministic Heuristic Provider | Source-grounded fact/entity extraction with hallucination defenses |
| **REST API Server** | `fastapi` + `uvicorn` | High-throughput asynchronous endpoints for file ingestion and structured querying |

---

## 4. Missing Components (To Be Built by Member 1)
1. **File Ingestion & Validation Pipeline** (`document_engine/ingestion/`):
   - Mime-type and magic-byte detection (PDF, DOCX, XLSX, CSV, TXT, PNG, JPG, TIFF).
   - SHA-256 deduplication and metadata extractor.
   - Status tracking and error resilience.
2. **Parser Subsystem** (`document_engine/parsers/`):
   - Digital PDF, Scanned PDF, Mixed PDF parser with direct-first OCR fallback.
   - DOCX parser (paragraphs, styles, tables).
   - Spreadsheet parser (XLSX, CSV) into normalized Markdown/JSON tables.
   - Text & Image parsers.
3. **OCR Provider Architecture** (`document_engine/ocr/`):
   - Pluggable `OCRProvider` base interface.
   - `WindowsMediaOCRProvider`, `TesseractOCRProvider`, `EasyOCRProvider`, `MockOCRProvider`.
4. **Document Normalization & Chunking** (`document_engine/normalization/` & `document_engine/chunking/`):
   - Canonical `Document`, `Page`, `Chunk`, `Table` schemas.
   - Bounded token chunking preserving sentence boundaries, headers, page numbers, and chunk IDs.
5. **LLM Extraction & Hallucination Defense** (`document_engine/llm/` & `document_engine/extraction/`):
   - Pluggable `LLMProvider` interface (Gemini, OpenAI, Ollama, Deterministic Rule Fallback).
   - Strict source grounding prompts with prompt injection protection.
   - Extraction of Candidate Entities, Candidate Facts (with values, units, validity windows), Candidate Relationships, and mandatory Evidence traces (`document_id`, `page_number`, `chunk_id`, `source_text`).
6. **FastAPI Contract for Member 2** (`document_engine/api/` & `document_engine/server.py`):
   - `POST /api/v1/document-intelligence/ingest`
   - `GET /api/v1/document-intelligence/{document_id}`
   - `POST /api/v1/document-intelligence/extract`
   - `GET /api/v1/document-intelligence/documents`
   - `GET /api/v1/health`
7. **Comprehensive Test Suite & Documentation**:
   - Unit and integration tests covering all document types, OCR fallback, prompt injection, and edge cases.
   - Architecture, API, Schema, Setup, and Test report docs.

---

## 5. Implementation Roadmap (Logical Commits)
1. `commit 1`: Document ingestion, file validation, mime detection, content hashing.
2. `commit 2`: Multi-format parsers (PDF, DOCX, XLSX, CSV, TXT).
3. `commit 3`: Pluggable OCR engine (`OCRProvider`) with Windows Native & fallback support.
4. `commit 4`: Canonical document normalization models (`Document`, `Page`, `Table`).
5. `commit 5`: Token-aware chunking preserving page/section provenance.
6. `commit 6`: LLM provider abstraction (`LLMProvider`) supporting Gemini, OpenAI, Ollama, and Deterministic Fallback.
7. `commit 7`: Extraction schemas (`ExtractedEntity`, `ExtractedFact`, `ExtractedRelationship`, `SourceEvidence`).
8. `commit 8`: AI extraction pipeline with prompt-injection defenses and source-grounding.
9. `commit 9`: Strict Pydantic output validation and repair/retry logic.
10. `commit 10`: Full automated test suite across all supported formats and edge cases.
11. `commit 11`: FastAPI service, endpoints, and clean integration contract for Member 2.
