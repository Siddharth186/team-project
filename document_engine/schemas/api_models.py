from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from .document import DocumentModel, PageModel, ChunkModel
from .extraction import ExtractedEntity, ExtractedFact, ExtractedRelationship, SourceEvidence

class DocumentIntelligenceResponse(BaseModel):
    document: DocumentModel
    pages: List[PageModel] = Field(default_factory=list)
    chunks: List[ChunkModel] = Field(default_factory=list)
    entities: List[ExtractedEntity] = Field(default_factory=list)
    facts: List[ExtractedFact] = Field(default_factory=list)
    relationships: List[ExtractedRelationship] = Field(default_factory=list)
    evidence: List[SourceEvidence] = Field(default_factory=list)

class BatchIngestionResponse(BaseModel):
    documents: List[DocumentIntelligenceResponse]
    total_documents: int
    success_count: int
    failed_count: int

class ExtractRequest(BaseModel):
    text: str
    document_id: Optional[str] = None
    page_number: Optional[int] = 1
    chunk_id: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    service: str
    ocr_provider: str
    llm_provider: str
    timestamp: str
