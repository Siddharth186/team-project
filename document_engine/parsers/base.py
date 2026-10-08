from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple
from ..schemas.document import PageModel

class BaseParser(ABC):
    """Abstract base class for all file type parsers."""

    @abstractmethod
    def parse(self, file_bytes: bytes, filename: str, document_id: str) -> Tuple[List[PageModel], Dict[str, Any]]:
        """
        Parse raw file bytes into normalized PageModel list and document-level metadata.
        Returns: (pages, doc_metadata)
        """
        pass
