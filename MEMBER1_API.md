# NEXUS AI — Member 1: API Specification & Integration Contract

This document specifies the REST API endpoints and Python Client interface exposed by Member 1 (Document Intelligence Engine) for consumption by **Member 2** (Facts & Contradictions) and **Member 3** (Reports & UI).

Base URL: `http://localhost:8000/api/v1`

---

## 1. Endpoints

### 1.1 Ingest Single Document
**POST** `/document-intelligence/ingest`
- **Content-Type**: `multipart/form-data`
- **Query Parameters**:
  - `allow_duplicate` (`bool`, optional, default `false`): If false, re-uploading an existing file hash returns the existing indexed document.
- **Form Body**:
  - `file`: Raw binary document file (`.pdf`, `.docx`, `.xlsx`, `.csv`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.tiff`).

#### Example `curl` Request:
```bash
curl -X POST "http://localhost:8000/api/v1/document-intelligence/ingest?allow_duplicate=true" \
  -F "file=@loan_application.pdf;type=application/pdf"
```

#### Successful Response (`200 OK`):
```json
{
  "document": {
    "document_id": "DOC-a1b2c3d4",
    "filename": "loan_application.pdf",
    "file_type": "pdf",
    "file_size": 145020,
    "page_count": 1,
    "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "status": "extracted",
    "created_at": "2026-10-08T12:00:00.000000",
    "metadata": {
      "processing_time_seconds": 0.145,
      "chunks_count": 1,
      "entities_count": 4,
      "facts_count": 5
    }
  },
  "pages": [
    {
      "page_id": "PAG-11223344",
      "document_id": "DOC-a1b2c3d4",
      "page_number": 1,
      "text": "Applicant Name: Ramesh Kumar\nMonthly Income: 45000 INR\nPAN Number: ABCDE1234F...",
      "has_scanned_content": false,
      "ocr_applied": false,
      "tables": [],
      "images": [],
      "metadata": {
        "char_count": 280
      }
    }
  ],
  "chunks": [
    {
      "chunk_id": "DOC-a1b2c3d4-P01-C01",
      "document_id": "DOC-a1b2c3d4",
      "page_start": 1,
      "page_end": 1,
      "section": null,
      "text": "Applicant Name: Ramesh Kumar\nMonthly Income: 45000 INR\nPAN Number: ABCDE1234F...",
      "token_count": 52,
      "metadata": {
        "page_number": 1
      }
    }
  ],
  "entities": [
    {
      "entity_id": "ENT-e01",
      "type": "PERSON",
      "value": "Ramesh Kumar",
      "source": {
        "document_id": "DOC-a1b2c3d4",
        "page_number": 1,
        "chunk_id": "DOC-a1b2c3d4-P01-C01",
        "source_text": "Applicant Name: Ramesh Kumar"
      },
      "confidence": 0.98
    }
  ],
  "facts": [
    {
      "fact_id": "FCT-f01",
      "entity_reference": "Ramesh Kumar",
      "attribute": "monthly_income",
      "value": 45000,
      "value_type": "number",
      "unit": "INR",
      "valid_from": null,
      "valid_to": null,
      "source": {
        "document_id": "DOC-a1b2c3d4",
        "page_number": 1,
        "chunk_id": "DOC-a1b2c3d4-P01-C01",
        "source_text": "Monthly Income: 45000 INR"
      },
      "extraction_confidence": 0.96
    }
  ],
  "relationships": [
    {
      "relationship_id": "REL-r01",
      "source_entity": "Ramesh Kumar",
      "relationship_type": "works_for",
      "target_entity": "Acme Global Technologies Ltd",
      "source": {
        "document_id": "DOC-a1b2c3d4",
        "page_number": 1,
        "chunk_id": "DOC-a1b2c3d4-P01-C01",
        "source_text": "Employer: Acme Global Technologies Ltd"
      },
      "confidence": 0.95
    }
  ],
  "evidence": [
    {
      "document_id": "DOC-a1b2c3d4",
      "page_number": 1,
      "chunk_id": "DOC-a1b2c3d4-P01-C01",
      "source_text": "Applicant Name: Ramesh Kumar"
    }
  ]
}
```

---

### 1.2 Ingest Batch of Documents
**POST** `/document-intelligence/ingest-batch`
- **Content-Type**: `multipart/form-data`
- **Form Body**: `files` (Array of files)

#### Successful Response (`200 OK`):
```json
{
  "documents": [ ... array of DocumentIntelligenceResponse ... ],
  "total_documents": 3,
  "success_count": 3,
  "failed_count": 0
}
```

---

### 1.3 Query Intelligence by Document ID (Primary Contract for Member 2)
**GET** `/document-intelligence/{document_id}`

#### Example `curl` Request:
```bash
curl -X GET "http://localhost:8000/api/v1/document-intelligence/DOC-a1b2c3d4"
```
Returns the full `DocumentIntelligenceResponse` JSON object with all pages, chunks, facts, entities, and evidence traces.

---

### 1.4 List Ingested Documents
**GET** `/document-intelligence/documents`
Returns list of all `DocumentModel` records stored in the engine registry.

---

### 1.5 Ad-Hoc Raw Text Extraction
**POST** `/document-intelligence/extract-text`
- **Content-Type**: `application/json`
- **Body**:
```json
{
  "text": "Applicant: Ramesh Kumar\nMonthly Income: 45000 INR\nPAN: ABCDE1234F",
  "document_id": "CUSTOM-DOC-1",
  "page_number": 1
}
```
Returns `ChunkExtractionOutput` containing entities, facts, relationships, and evidence.

---

### 1.6 Health & Diagnostics
**GET** `/health`
Returns active system status, OCR provider, and LLM provider.

---

## 2. Python Client SDK for Member 2
Member 2 can also import and use the Python client directly without running an HTTP request:

```python
from document_engine.client import DocumentEngineClient

# Initialize client
client = DocumentEngineClient()

# Process a local file path
result = client.process_document("path/to/loan_application.pdf")

# Access extracted entities and facts
print(f"Document ID: {result.document.document_id}")
for fact in result.facts:
    print(f"Fact: {fact.entity_reference} -> {fact.attribute} = {fact.value} {fact.unit or ''}")
    print(f"  Provenance: Doc {fact.source.document_id}, Page {fact.source.page_number}, Quote: '{fact.source.source_text}'")

# Process batch
batch_results = client.process_batch([
    ("app1.pdf", pdf1_bytes),
    ("salary_slip.png", image_bytes),
    ("bank_statement.csv", csv_bytes)
])
```
