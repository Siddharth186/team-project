# NEXUS AI — Member 1: Canonical Data Schemas

This document defines the strict Pydantic v2 and JSON schemas implemented by Member 1.

---

## 1. Document Model (`DocumentModel`)
Represents document-level metadata, storage reference, status, and content hash.

```python
class DocumentModel(BaseModel):
    document_id: str             # e.g., "DOC-a1b2c3d4"
    filename: str                # e.g., "loan_application.pdf"
    file_type: str               # "pdf" | "docx" | "xlsx" | "csv" | "txt" | "image"
    file_size: int               # in bytes
    page_count: int              # total pages parsed
    content_hash: str            # SHA-256 hash for deduplication
    status: str                  # "pending" | "parsed" | "extracted" | "failed"
    error_message: Optional[str] # Failure reason if status == "failed"
    created_at: str              # ISO-8601 UTC timestamp
    metadata: Dict[str, Any]     # Format-specific metadata
```

---

## 2. Page Model (`PageModel`)
Represents a single parsed page or worksheet.

```python
class PageModel(BaseModel):
    page_id: str                 # e.g., "PAG-11223344"
    document_id: str             # Parent document reference
    page_number: int             # 1-indexed page number
    text: str                    # Full text of the page
    has_scanned_content: bool    # True if page contains raster images
    ocr_applied: bool            # True if OCR was triggered
    tables: List[TableModel]     # Extracted tabular structures
    images: List[Dict[str, Any]] # Image bounding/dimension metadata
    metadata: Dict[str, Any]     # Dimensions, rotation, char counts
```

---

## 3. Table Model (`TableModel`)
Represents structured tabular data extracted from PDFs, Word documents, or spreadsheets.

```python
class TableModel(BaseModel):
    table_id: str                # e.g., "TBL-55667788"
    page_number: int             # 1-indexed page location
    headers: List[str]           # Column header strings
    rows: List[List[Any]]        # Grid cell rows
    markdown: str                # Serialized Markdown table representation
    metadata: Dict[str, Any]     # Sheet name, bbox coordinates, etc.
```

---

## 4. Chunk Model (`ChunkModel`)
Represents bounded text chunks preserving provenance and sentence boundaries.

```python
class ChunkModel(BaseModel):
    chunk_id: str                # e.g., "DOC-a1b2c3d4-P01-C01"
    document_id: str             # Parent document reference
    page_start: int              # Starting page number
    page_end: int                # Ending page number
    section: Optional[str]       # Heading or section name if identified
    text: str                    # Chunk text
    token_count: int             # Estimated token count (~1.3 tokens/word)
    metadata: Dict[str, Any]     # Provenance metadata
```

---

## 5. Source Evidence Model (`SourceEvidence`)
Mandatory traceability contract linking any extracted intelligence back to its physical origin.

```python
class SourceEvidence(BaseModel):
    document_id: str             # Source document ID
    page_number: int             # Source page number
    chunk_id: Optional[str]      # Source chunk ID
    source_text: str             # Verbatim quotation from source text
```

---

## 6. Extracted Entity Model (`ExtractedEntity`)
Candidate entity candidate identified in the document (to be reconciled across documents by Member 2).

```python
class ExtractedEntity(BaseModel):
    entity_id: str               # e.g., "ENT-8899aabb"
    type: str                    # "PERSON" | "ORGANIZATION" | "MONEY" | "ID" | "DATE" | "LOCATION" | "PROJECT" | "CONTRACT"
    value: str                   # Exact entity surface string, e.g. "Ramesh Kumar"
    source: SourceEvidence       # Provenance trace
    confidence: float            # 0.0 to 1.0 (default: 0.95+)
    metadata: Dict[str, Any]
```

---

## 7. Extracted Fact Model (`ExtractedFact`)
Atomic unit of intelligence representing an entity-attribute-value assertion with provenance and time validity.

```python
class ExtractedFact(BaseModel):
    fact_id: str                 # e.g., "FCT-ccddeeff"
    entity_reference: str        # Entity name or reference key (e.g. "Ramesh Kumar")
    attribute: str               # Normalized attribute key (e.g. "monthly_income", "pan_number")
    value: Any                   # Typed value (number, string, bool, etc.)
    value_type: str              # "number" | "string" | "boolean" | "date" | "currency" | "array"
    unit: Optional[str]          # Unit of measurement ("INR", "USD", "%", "years")
    valid_from: Optional[str]    # ISO date / year or null
    valid_to: Optional[str]      # ISO date / year or null
    source: SourceEvidence       # Mandatory provenance
    extraction_confidence: float # 0.0 to 1.0
    metadata: Dict[str, Any]
```

---

## 8. Extracted Relationship Model (`ExtractedRelationship`)
Candidate relationship connecting two entities.

```python
class ExtractedRelationship(BaseModel):
    relationship_id: str         # e.g., "REL-11335577"
    source_entity: str           # Source entity name (e.g. "Ramesh Kumar")
    relationship_type: str       # "works_for" | "applied_for" | "issued_by" | "owns" | "manages"
    target_entity: str           # Target entity name (e.g. "Acme Global Technologies Ltd")
    source: SourceEvidence       # Mandatory provenance
    confidence: float            # 0.0 to 1.0
    metadata: Dict[str, Any]
```

---

## 9. Full Intelligence Response (`DocumentIntelligenceResponse`)
The composite response returned by `/document-intelligence/{document_id}`:

```python
class DocumentIntelligenceResponse(BaseModel):
    document: DocumentModel
    pages: List[PageModel]
    chunks: List[ChunkModel]
    entities: List[ExtractedEntity]
    facts: List[ExtractedFact]
    relationships: List[ExtractedRelationship]
    evidence: List[SourceEvidence]
```
