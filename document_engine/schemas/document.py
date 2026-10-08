from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class TableModel(BaseModel):
    table_id: str = Field(default_factory=lambda: f"TBL-{uuid.uuid4().hex[:8]}")
    page_number: int = 1
    headers: List[str] = Field(default_factory=list)
    rows: List[List[Any]] = Field(default_factory=list)
    markdown: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)

class PageModel(BaseModel):
    page_id: str = Field(default_factory=lambda: f"PAG-{uuid.uuid4().hex[:8]}")
    document_id: str
    page_number: int
    text: str = ""
    has_scanned_content: bool = False
    ocr_applied: bool = False
    tables: List[TableModel] = Field(default_factory=list)
    images: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ChunkModel(BaseModel):
    chunk_id: str = Field(default_factory=lambda: f"CHK-{uuid.uuid4().hex[:8]}")
    document_id: str
    page_start: int
    page_end: int
    section: Optional[str] = None
    text: str
    token_count: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentModel(BaseModel):
    document_id: str = Field(default_factory=lambda: f"DOC-{uuid.uuid4().hex[:8]}")
    filename: str
    file_type: str # pdf, docx, xlsx, csv, txt, image
    file_size: int
    page_count: int = 0
    content_hash: str # SHA-256
    status: str = "pending" # pending, parsed, extracted, failed
    error_message: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Dict[str, Any] = Field(default_factory=dict)
