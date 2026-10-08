import io
import logging
from typing import List, Dict, Any, Tuple
from PIL import Image
from .base import BaseParser
from ..schemas.document import PageModel
from ..ocr.manager import OCRManager

logger = logging.getLogger(__name__)

class ImageParser(BaseParser):
    """Parses standalone image documents (PNG, JPEG, TIFF, BMP, WEBP) using OCR."""

    def __init__(self, ocr_manager: OCRManager = None):
        self.ocr_manager = ocr_manager or OCRManager()

    def parse(self, file_bytes: bytes, filename: str, document_id: str) -> Tuple[List[PageModel], Dict[str, Any]]:
        # Read image properties with PIL
        img = Image.open(io.BytesIO(file_bytes))
        width, height = img.size
        img_format = img.format or "UNKNOWN"
        img_mode = img.mode

        # Execute OCR
        extracted_text = self.ocr_manager.extract_text(file_bytes).strip()

        page = PageModel(
            document_id=document_id,
            page_number=1,
            text=extracted_text,
            has_scanned_content=True,
            ocr_applied=True,
            images=[{"format": img_format, "width": width, "height": height, "mode": img_mode}],
            metadata={
                "image_width": width,
                "image_height": height,
                "image_format": img_format,
                "image_mode": img_mode,
                "char_count": len(extracted_text)
            }
        )

        doc_metadata = {
            "parser": "ImageParser",
            "image_format": img_format,
            "dimensions": f"{width}x{height}",
            "ocr_applied": True,
            "page_count": 1
        }

        return [page], doc_metadata
