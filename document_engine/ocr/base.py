from abc import ABC, abstractmethod
from typing import Any, Optional

class OCRProvider(ABC):
    """Abstract base class for OCR engines."""

    @abstractmethod
    def is_available(self) -> bool:
        """Check if the OCR provider is operational on current environment."""
        pass

    @abstractmethod
    def extract_text_from_image_bytes(self, image_bytes: bytes) -> str:
        """Extract text from raw image bytes (PNG, JPEG, etc.)."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier name."""
        pass
