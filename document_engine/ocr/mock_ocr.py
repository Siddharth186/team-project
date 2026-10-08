import io
import logging
from PIL import Image
from .base import OCRProvider

logger = logging.getLogger(__name__)

class MockOCRProvider(OCRProvider):
    """
    Fallback deterministic OCR provider for CI/CD, unit testing, and resilience.
    Extracts embedded image metadata or basic OCR fallback markers.
    """

    def __init__(self, simulated_text: str = ""):
        self.simulated_text = simulated_text

    def is_available(self) -> bool:
        return True

    def get_provider_name(self) -> str:
        return "mock_ocr"

    def extract_text_from_image_bytes(self, image_bytes: bytes) -> str:
        if self.simulated_text:
            return self.simulated_text
        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size
            return f"[SCANNED DOCUMENT OCR: Recognized image format {img.format} size {w}x{h} with standard contrast]"
        except Exception:
            return "[SCANNED DOCUMENT OCR: Content processed successfully]"
