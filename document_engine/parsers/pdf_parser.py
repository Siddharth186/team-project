import io
import logging
from typing import List, Dict, Any, Tuple
from .base import BaseParser
from ..schemas.document import PageModel, TableModel
from ..ocr.manager import OCRManager
from ..config import settings

logger = logging.getLogger(__name__)

class PDFParser(BaseParser):
    """
    Advanced multi-strategy PDF parser supporting:
    1. Digital PDFs (Direct vector text & structured table extraction)
    2. Scanned PDFs (Raster page rendering + OCR fallback)
    3. Mixed PDFs (Per-page selective digital/OCR routing)
    """

    def __init__(self, ocr_manager: OCRManager = None):
        self.ocr_manager = ocr_manager or OCRManager()

    def parse(self, file_bytes: bytes, filename: str, document_id: str) -> Tuple[List[PageModel], Dict[str, Any]]:
        pages: List[PageModel] = []
        doc_metadata: Dict[str, Any] = {
            "parser": "PDFParser",
            "pdf_type": "digital",
            "extracted_tables_count": 0,
            "scanned_pages_count": 0
        }

        try:
            import fitz # PyMuPDF
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            page_count = len(doc)
            scanned_pages = 0
            total_tables = 0

            for p_idx in range(page_count):
                page = doc[p_idx]
                page_num = p_idx + 1
                page_text = page.get_text("text").strip()
                
                # Check for tables using PyMuPDF table finder
                tables: List[TableModel] = []
                try:
                    tabs = page.find_tables()
                    for t_idx, tab in enumerate(tabs.tables):
                        extracted_tab = tab.extract()
                        if extracted_tab and len(extracted_tab) > 0:
                            raw_headers = [str(c or "").strip() for c in extracted_tab[0]]
                            raw_rows = [[str(c or "").strip() for c in r] for r in extracted_tab[1:]]
                            
                            # Generate markdown representation
                            md_lines = []
                            md_lines.append("| " + " | ".join(raw_headers) + " |")
                            md_lines.append("| " + " | ".join(["---"] * len(raw_headers)) + " |")
                            for r in raw_rows:
                                md_lines.append("| " + " | ".join(r) + " |")
                            table_md = "\n".join(md_lines)

                            tables.append(TableModel(
                                page_number=page_num,
                                headers=raw_headers,
                                rows=raw_rows,
                                markdown=table_md,
                                metadata={"bbox": tab.bbox, "table_index": t_idx + 1}
                            ))
                            total_tables += 1
                except Exception as te:
                    logger.debug(f"Table extraction notice on page {page_num}: {te}")

                # Determine if page is scanned or needs OCR
                has_scanned = False
                ocr_applied = False
                
                if len(page_text) < settings.OCR_MIN_TEXT_CHARS:
                    # Sparse or no digital text -> attempt OCR fallback
                    try:
                        pix = page.get_pixmap(dpi=200)
                        img_bytes = pix.tobytes("png")
                        ocr_text = self.ocr_manager.extract_text(img_bytes).strip()
                        if ocr_text:
                            page_text = (page_text + "\n" + ocr_text).strip() if page_text else ocr_text
                            has_scanned = True
                            ocr_applied = True
                            scanned_pages += 1
                    except Exception as oe:
                        logger.warning(f"OCR fallback failed on page {page_num}: {oe}")

                # Check for embedded images count
                image_list = page.get_images(full=True)
                images_info = [{"xref": img[0], "width": img[2], "height": img[3]} for img in image_list]

                pages.append(PageModel(
                    document_id=document_id,
                    page_number=page_num,
                    text=page_text,
                    has_scanned_content=has_scanned,
                    ocr_applied=ocr_applied,
                    tables=tables,
                    images=images_info,
                    metadata={
                        "char_count": len(page_text),
                        "width": page.rect.width,
                        "height": page.rect.height,
                        "rotation": page.rotation
                    }
                ))

            # Classify overall PDF type
            if scanned_pages == page_count and page_count > 0:
                doc_metadata["pdf_type"] = "scanned"
            elif scanned_pages > 0:
                doc_metadata["pdf_type"] = "mixed"
            else:
                doc_metadata["pdf_type"] = "digital"

            doc_metadata["scanned_pages_count"] = scanned_pages
            doc_metadata["extracted_tables_count"] = total_tables
            doc_metadata["page_count"] = page_count

            return pages, doc_metadata

        except Exception as fitz_err:
            logger.warning(f"PyMuPDF failed ({fitz_err}), attempting pypdf fallback...")
            return self._parse_with_pypdf(file_bytes, filename, document_id)

    def _parse_with_pypdf(self, file_bytes: bytes, filename: str, document_id: str) -> Tuple[List[PageModel], Dict[str, Any]]:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages: List[PageModel] = []
        page_count = len(reader.pages)
        
        for idx, page in enumerate(reader.pages):
            p_num = idx + 1
            text = page.extract_text() or ""
            pages.append(PageModel(
                document_id=document_id,
                page_number=p_num,
                text=text.strip(),
                metadata={"char_count": len(text)}
            ))

        return pages, {
            "parser": "pypdf_fallback",
            "pdf_type": "digital",
            "page_count": page_count
        }
