from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
import uuid

class SourceEvidence(BaseModel):
    document_id: str
    page_number: int
    chunk_id: Optional[str] = None
    source_text: str

class ExtractedEntity(BaseModel):
    entity_id: str = Field(default_factory=lambda: f"ENT-{uuid.uuid4().hex[:8]}")
    type: str # e.g. PERSON, ORGANIZATION, LOCATION, DATE, ID, MONEY, ASSET, CONTRACT, PROJECT
    value: str
    source: SourceEvidence
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ExtractedFact(BaseModel):
    fact_id: str = Field(default_factory=lambda: f"FCT-{uuid.uuid4().hex[:8]}")
    entity_reference: str # Name or entity_id of the entity this fact belongs to
    attribute: str # e.g., monthly_income, pan_number, loan_amount, date_of_birth, employer_name
    value: Union[str, int, float, bool, List[Any], Dict[str, Any], None]
    value_type: str = "string" # "number", "string", "boolean", "date", "currency", "array", "object"
    unit: Optional[str] = None # e.g., "INR", "USD", "years", "%"
    valid_from: Optional[str] = None # ISO date or year if available
    valid_to: Optional[str] = None # ISO date or year if available
    source: SourceEvidence
    extraction_confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ExtractedRelationship(BaseModel):
    relationship_id: str = Field(default_factory=lambda: f"REL-{uuid.uuid4().hex[:8]}")
    source_entity: str # Entity name or reference
    relationship_type: str # works_for, manages, owns, issued_by, applies_for, has_budget, belongs_to, verified_by
    target_entity: str # Entity name or reference
    source: SourceEvidence
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ChunkExtractionOutput(BaseModel):
    entities: List[ExtractedEntity] = Field(default_factory=list)
    facts: List[ExtractedFact] = Field(default_factory=list)
    relationships: List[ExtractedRelationship] = Field(default_factory=list)
    evidence: List[SourceEvidence] = Field(default_factory=list)
