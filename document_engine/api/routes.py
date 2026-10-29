from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
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


# --- UNIVERSAL MULTI-FORMAT DOCUMENT GENERATION ENDPOINTS ---
from ..generation.generator import UniversalDocumentGenerator

class PdfGenerateRequest(BaseModel):
    title: str
    subtitle: Optional[str] = "NEXUS AI Grounded Intelligence Dossier"
    sections: Optional[List[Dict[str, Any]]] = None
    code_snippets: Optional[List[Dict[str, str]]] = None
    tables: Optional[List[Dict[str, Any]]] = None
    citations: Optional[List[str]] = None
    filename: Optional[str] = None

class ExcelGenerateRequest(BaseModel):
    title: str
    sheets_data: Dict[str, List[Dict[str, Any]]]
    filename: Optional[str] = None

class DiagramGenerateRequest(BaseModel):
    topic: str
    title: Optional[str] = "System Architecture & Flow Diagram"
    filename: Optional[str] = None

class DocxGenerateRequest(BaseModel):
    title: str
    subtitle: Optional[str] = "NEXUS AI Grounded Intelligence Dossier"
    sections: Optional[List[Dict[str, Any]]] = None
    code_snippets: Optional[List[Dict[str, str]]] = None
    filename: Optional[str] = None

@router.post("/generate/pdf")
def generate_pdf_endpoint(req: PdfGenerateRequest):
    return UniversalDocumentGenerator.generate_pdf(
        title=req.title,
        subtitle=req.subtitle or "NEXUS AI Grounded Intelligence Dossier",
        sections=req.sections,
        code_snippets=req.code_snippets,
        tables=req.tables,
        citations=req.citations,
        filename=req.filename
    )

@router.post("/generate/excel")
def generate_excel_endpoint(req: ExcelGenerateRequest):
    return UniversalDocumentGenerator.generate_excel(
        title=req.title,
        sheets_data=req.sheets_data,
        filename=req.filename
    )

@router.post("/generate/diagram")
def generate_diagram_endpoint(req: DiagramGenerateRequest):
    return UniversalDocumentGenerator.generate_diagram(
        topic=req.topic,
        title=req.title or "System Architecture & Flow Diagram",
        filename=req.filename
    )

@router.post("/generate/docx")
def generate_docx_endpoint(req: DocxGenerateRequest):
    return UniversalDocumentGenerator.generate_docx(
        title=req.title,
        subtitle=req.subtitle or "NEXUS AI Grounded Intelligence Dossier",
        sections=req.sections,
        code_snippets=req.code_snippets,
        filename=req.filename
    )
