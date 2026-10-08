import io
import logging
from PIL import Image
from .base import OCRProvider

logger = logging.getLogger(__name__)

class TesseractOCRProvider(OCRProvider):
    """OCR engine using PyTesseract."""

    def __init__(self):
        self._available = self._check_availability()

    def _check_availability(self) -> bool:
        try:
            import pytesseract
            # Quick check if tesseract binary is in path or configured
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def is_available(self) -> bool:
        return self._available

    def get_provider_name(self) -> str:
        return "pytesseract"

    def extract_text_from_image_bytes(self, image_bytes: bytes) -> str:
        if not self._available:
            raise RuntimeError("PyTesseract OCR is not available.")
        try:
            import pytesseract
            img = Image.open(io.BytesIO(image_bytes))
            return pytesseract.image_to_string(img)
        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            return ""
