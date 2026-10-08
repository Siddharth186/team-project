import logging
from typing import List, Dict, Any, Tuple
from .base import BaseParser
from ..schemas.document import PageModel

logger = logging.getLogger(__name__)

class TextParser(BaseParser):
    """Parses plain text (.txt, .md, .log, .json) documents."""

    def parse(self, file_bytes: bytes, filename: str, document_id: str) -> Tuple[List[PageModel], Dict[str, Any]]:
        text_content = file_bytes.decode("utf-8", errors="replace").strip()
        
        # If very long, split into pages approximately every 3000 chars or form-feed markers
        pages: List[PageModel] = []
        if "\x0c" in text_content: # Form feed page delimiter
            raw_pages = text_content.split("\x0c")
        else:
            # Check length; if single page
            raw_pages = [text_content]

        for idx, page_text in enumerate(raw_pages):
            pages.append(PageModel(
                document_id=document_id,
                page_number=idx + 1,
                text=page_text.strip(),
                metadata={"char_count": len(page_text)}
            ))

        doc_metadata = {
            "parser": "TextParser",
            "page_count": len(pages),
            "char_count": len(text_content)
        }

        return pages, doc_metadata
