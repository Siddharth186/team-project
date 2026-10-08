from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from ..schemas.api_models import (
    DocumentIntelligenceResponse,
    BatchIngestionResponse,
    ExtractRequest,
    HealthResponse
)
from ..schemas.document import DocumentModel, ChunkModel
from ..schemas.extraction import ChunkExtractionOutput
from ..pipeline import DocumentIntelligenceEngine
from .dependencies import get_engine
from ..config import settings

router = APIRouter(prefix="/api/v1", tags=["Document Intelligence Engine"])

@router.get("/health", response_model=HealthResponse)
def health_check(engine: DocumentIntelligenceEngine = Depends(get_engine)):
    return HealthResponse(
        status="healthy",
        service=settings.APP_NAME,
        ocr_provider=engine.ocr_mgr.provider.get_provider_name(),
        llm_provider=engine.extraction_engine.llm_provider.get_provider_name(),
        timestamp=datetime.utcnow().isoformat()
    )

@router.post("/document-intelligence/ingest", response_model=DocumentIntelligenceResponse)
async def ingest_document(
    file: UploadFile = File(...),
    allow_duplicate: bool = Query(default=False),
    engine: DocumentIntelligenceEngine = Depends(get_engine)
):
    """
    Ingest and process a single document (PDF, DOCX, XLSX, CSV, TXT, Image).
    Returns fully normalized pages, chunks, extracted entities, facts, relationships, and evidence.
    """
    try:
        content = await file.read()
        response = engine.process_file_bytes(
            filename=file.filename,
            file_bytes=content,
            allow_duplicate=allow_duplicate
        )
        if response.document.status == "failed":
            raise HTTPException(status_code=400, detail=response.document.error_message or "Failed to process document.")
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal document engine error: {str(e)}")

@router.post("/document-intelligence/ingest-batch", response_model=BatchIngestionResponse)
async def ingest_documents_batch(
    files: List[UploadFile] = File(...),
    allow_duplicate: bool = Query(default=False),
    engine: DocumentIntelligenceEngine = Depends(get_engine)
):
    """
    Ingest and process multiple documents concurrently or sequentially.
    """
    results: List[DocumentIntelligenceResponse] = []
    success_count = 0
    failed_count = 0

    for file in files:
        try:
            content = await file.read()
            res = engine.process_file_bytes(
                filename=file.filename,
                file_bytes=content,
                allow_duplicate=allow_duplicate
            )
            results.append(res)
            if res.document.status == "failed":
                failed_count += 1
            else:
                success_count += 1
        except Exception as e:
            failed_count += 1

    return BatchIngestionResponse(
        documents=results,
        total_documents=len(files),
        success_count=success_count,
        failed_count=failed_count
    )

@router.get("/document-intelligence/documents", response_model=List[DocumentModel])
def list_documents(engine: DocumentIntelligenceEngine = Depends(get_engine)):
    """List all ingested documents in the registry."""
    return engine.list_all_documents()

@router.get("/document-intelligence/{document_id}", response_model=DocumentIntelligenceResponse)
def get_document_intelligence(
    document_id: str,
    engine: DocumentIntelligenceEngine = Depends(get_engine)
):
    """
    Retrieve normalized document, pages, chunks, entities, facts, relationships, and source evidence.
    Primary contract endpoint consumed by Member 2.
    """
    res = engine.get_document_result(document_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Document with ID '{document_id}' not found.")
    return res

@router.post("/document-intelligence/extract-text", response_model=ChunkExtractionOutput)
def extract_from_raw_text(
    req: ExtractRequest,
    engine: DocumentIntelligenceEngine = Depends(get_engine)
):
    """
    Direct extraction endpoint for arbitrary text fragments with custom provenance tags.
    """
    doc_id = req.document_id or "ADHOC-001"
    page_num = req.page_number or 1
    chunk_id = req.chunk_id or f"{doc_id}-P{page_num:02d}-C01"

    chunk = ChunkModel(
        chunk_id=chunk_id,
        document_id=doc_id,
        page_start=page_num,
        page_end=page_num,
        text=req.text
    )

    entities, facts, relationships, evidence = engine.extraction_engine.extract_from_chunks(
        document_id=doc_id,
        chunks=[chunk]
    )

    return ChunkExtractionOutput(
        entities=entities,
        facts=facts,
        relationships=relationships,
        evidence=evidence
    )
