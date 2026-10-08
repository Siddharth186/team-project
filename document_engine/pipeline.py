import time
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from .schemas.document import DocumentModel, PageModel, ChunkModel
from .schemas.extraction import ExtractedEntity, ExtractedFact, ExtractedRelationship, SourceEvidence
from .schemas.api_models import DocumentIntelligenceResponse
from .ingestion.manager import IngestionManager
from .parsers.factory import ParserFactory
from .ocr.manager import OCRManager
from .normalization.normalizer import DocumentNormalizer
from .chunking.chunker import DocumentChunker
from .extraction.engine import ExtractionEngine
from .llm.factory import LLMProviderFactory

logger = logging.getLogger(__name__)

class DocumentIntelligenceEngine:
    """
    Master pipeline for Member 1:
    RAW BYTES -> INGESTION -> PARSING -> OCR -> NORMALIZATION -> CHUNKING -> EXTRACTION -> RESULT
    """

    def __init__(
        self,
        ingestion_manager: Optional[IngestionManager] = None,
        ocr_manager: Optional[OCRManager] = None,
        parser_factory: Optional[ParserFactory] = None,
        chunker: Optional[DocumentChunker] = None,
        extraction_engine: Optional[ExtractionEngine] = None
    ):
        self.ingestion_mgr = ingestion_manager or IngestionManager()
        self.ocr_mgr = ocr_manager or OCRManager()
        self.parser_factory = parser_factory or ParserFactory(ocr_manager=self.ocr_mgr)
        self.chunker = chunker or DocumentChunker()
        self.extraction_engine = extraction_engine or ExtractionEngine()
        
        # Cache for processed responses
        self._cache: Dict[str, DocumentIntelligenceResponse] = {}

    def process_file_bytes(
        self,
        filename: str,
        file_bytes: bytes,
        allow_duplicate: bool = False
    ) -> DocumentIntelligenceResponse:
        start_time = time.time()
        
        # 1. Ingestion & Validation
        doc = self.ingestion_mgr.ingest_bytes(filename, file_bytes, allow_duplicate=allow_duplicate)
        
        # Check cache if already fully processed and duplicate
        if doc.metadata.get("is_duplicate") and doc.document_id in self._cache:
            logger.info(f"Returning cached response for duplicate document {doc.document_id} ({filename})")
            return self._cache[doc.document_id]

        try:
            # 2. Parsing (with embedded OCR routing)
            parser = self.parser_factory.get_parser_for_filename(filename)
            pages, parser_meta = parser.parse(file_bytes, filename, doc.document_id)

            # 3. Normalization
            doc = DocumentNormalizer.normalize(doc, pages, parser_meta)

            # 4. Chunking
            chunks = self.chunker.chunk_pages(doc.document_id, pages)

            # 5. Extraction (Entities, Facts, Relationships, Evidence)
            entities, facts, relationships, evidence = self.extraction_engine.extract_from_chunks(
                document_id=doc.document_id,
                chunks=chunks
            )

            # 6. Final Status & Performance Tracking
            elapsed = time.time() - start_time
            doc.status = "extracted"
            doc.metadata["processing_time_seconds"] = round(elapsed, 3)
            doc.metadata["chunks_count"] = len(chunks)
            doc.metadata["entities_count"] = len(entities)
            doc.metadata["facts_count"] = len(facts)
            doc.metadata["relationships_count"] = len(relationships)
            doc.metadata["evidence_count"] = len(evidence)

            self.ingestion_mgr.update_document(doc)

            response = DocumentIntelligenceResponse(
                document=doc,
                pages=pages,
                chunks=chunks,
                entities=entities,
                facts=facts,
                relationships=relationships,
                evidence=evidence
            )

            self._cache[doc.document_id] = response
            return response

        except Exception as e:
            logger.error(f"Pipeline failure for document {doc.document_id} ({filename}): {e}", exc_info=True)
            doc.status = "failed"
            doc.error_message = str(e)
            self.ingestion_mgr.update_document(doc)
            return DocumentIntelligenceResponse(
                document=doc,
                pages=[],
                chunks=[],
                entities=[],
                facts=[],
                relationships=[],
                evidence=[]
            )

    def process_file_path(self, file_path: str | Path) -> DocumentIntelligenceResponse:
        path = Path(file_path)
        with open(path, "rb") as f:
            return self.process_file_bytes(path.name, f.read())

    def get_document_result(self, document_id: str) -> Optional[DocumentIntelligenceResponse]:
        if document_id in self._cache:
            return self._cache[document_id]
        
        doc = self.ingestion_mgr.get_document(document_id)
        if not doc:
            return None
            
        file_path = self.ingestion_mgr.get_file_path(document_id)
        if file_path and file_path.exists():
            with open(file_path, "rb") as f:
                return self.process_file_bytes(doc.filename, f.read(), allow_duplicate=True)
                
        return DocumentIntelligenceResponse(document=doc)

    def list_all_documents(self) -> List[DocumentModel]:
        return self.ingestion_mgr.list_documents()
