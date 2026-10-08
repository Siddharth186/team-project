from typing import List, Optional
from pathlib import Path
from .pipeline import DocumentIntelligenceEngine
from .schemas.api_models import DocumentIntelligenceResponse
from .schemas.document import DocumentModel

class DocumentEngineClient:
    """
    Direct Python programmatic client for Member 2 and Member 3.
    Provides synchronous and batch ingestion, parsing, extraction, and provenance querying.
    """

    def __init__(self, engine: Optional[DocumentIntelligenceEngine] = None):
        self.engine = engine or DocumentIntelligenceEngine()

    def process_document(self, file_path_or_name: str, file_bytes: Optional[bytes] = None) -> DocumentIntelligenceResponse:
        """Process a single document from file path or raw bytes."""
        if file_bytes is not None:
            return self.engine.process_file_bytes(file_path_or_name, file_bytes)
        return self.engine.process_file_path(file_path_or_name)

    def process_batch(self, files: List[tuple[str, bytes]]) -> List[DocumentIntelligenceResponse]:
        """Process a list of (filename, file_bytes) tuples."""
        results = []
        for filename, b in files:
            res = self.engine.process_file_bytes(filename, b)
            results.append(res)
        return results

    def get_document(self, document_id: str) -> Optional[DocumentIntelligenceResponse]:
        """Retrieve full intelligence object by document ID."""
        return self.engine.get_document_result(document_id)

    def list_documents(self) -> List[DocumentModel]:
        """List all indexed documents."""
        return self.engine.list_all_documents()
