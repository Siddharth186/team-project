import logging
from typing import Optional
from .base import OCRProvider
from .windows_media_ocr import WindowsMediaOCRProvider
from .tesseract_ocr import TesseractOCRProvider
from .mock_ocr import MockOCRProvider
from ..config import settings

logger = logging.getLogger(__name__)

class OCRManager:
    """Manages selection and fallback execution across available OCR providers."""

    def __init__(self, provider_name: Optional[str] = None):
        self.provider_name = provider_name or settings.OCR_PROVIDER
        self._provider = self._resolve_provider(self.provider_name)

    def _resolve_provider(self, name: str) -> OCRProvider:
        name = name.lower()
        if name == "winrt" or name == "windows":
            p = WindowsMediaOCRProvider()
            if p.is_available():
                return p
        elif name == "tesseract":
            p = TesseractOCRProvider()
            if p.is_available():
                return p
        elif name == "mock":
            return MockOCRProvider()

        # Auto-detection priority: Windows Media OCR -> Tesseract -> Mock Fallback
        win_p = WindowsMediaOCRProvider()
        if win_p.is_available():
            logger.info("Auto-selected Windows Media OCR provider.")
            return win_p

        tess_p = TesseractOCRProvider()
        if tess_p.is_available():
            logger.info("Auto-selected Tesseract OCR provider.")
            return tess_p

        logger.info("Defaulted to Fallback Mock OCR provider.")
        return MockOCRProvider()

    @property
    def provider(self) -> OCRProvider:
        return self._provider

    def extract_text(self, image_bytes: bytes) -> str:
        try:
            return self._provider.extract_text_from_image_bytes(image_bytes)
        except Exception as e:
            logger.warning(f"Primary OCR failed ({e}). Attempting fallback to MockOCRProvider.")
            return MockOCRProvider().extract_text_from_image_bytes(image_bytes)
