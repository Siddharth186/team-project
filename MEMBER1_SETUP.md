# NEXUS AI — Member 1: Setup & Developer Guide

## 1. Quick Start Guide

### 1.1 Prerequisites
- Python 3.10+
- Git

### 1.2 Installation
Clone or checkout the `feature/member1-document-engine` branch and install dependencies:

```bash
git checkout feature/member1-document-engine
pip install -r requirements.txt
```

---

## 2. Environment Configuration
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Key Environment Variables:
| Variable | Description | Default |
|---|---|---|
| `LLM_PROVIDER` | `gemini`, `openai`, `ollama`, or `deterministic` | `gemini` |
| `GEMINI_API_KEY` | Google Gemini API Key | `""` |
| `GEMINI_MODEL` | Gemini Model Name | `gemini-1.5-flash` |
| `OPENAI_API_KEY` | OpenAI API Key (if using OpenAI) | `""` |
| `OCR_PROVIDER` | `auto`, `winrt`, `tesseract`, or `mock` | `auto` |
| `STORAGE_DIR` | Directory for uploaded raw files & hash registry | `./data/documents` |
| `PORT` | FastAPI server port | `8000` |

> **Note on Zero-Configuration Offline Mode**:
> If no `GEMINI_API_KEY` or `OPENAI_API_KEY` is provided, the engine automatically falls back to `DeterministicLLMProvider`. This ensures full offline testing and zero disruption during live demos.

---

## 3. Running Automated Tests
Run the full test suite with pytest:

```bash
pytest -v tests/test_suite.py
```

All 17 tests verify ingestion, parsers, OCR, chunking, prompt injection protection, LLM extraction, and API routes.

---

## 4. Running the REST API Server
Start the Uvicorn server:

```bash
python -m uvicorn document_engine.server:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger documentation is available at:
`http://localhost:8000/docs`

---

## 5. Integration Guide for Member 2

### Method A: REST API
Call `POST /api/v1/document-intelligence/ingest` or `GET /api/v1/document-intelligence/{document_id}` to retrieve parsed documents and structured facts.

### Method B: Direct Python SDK
```python
from document_engine.client import DocumentEngineClient

client = DocumentEngineClient()
intelligence = client.process_document("documents/application.pdf")

# Ingested facts ready for Member 2 comparison and contradiction detection:
for fact in intelligence.facts:
    # fact.entity_reference, fact.attribute, fact.value, fact.source.source_text
    ...
```
