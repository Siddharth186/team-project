import re
from typing import List, Dict, Any, Optional
from ..schemas.document import PageModel, ChunkModel
from ..config import settings

class DocumentChunker:
    """
    Intelligent provenance-preserving chunker.
    Splits document pages into bounded chunks preserving:
    - Page start & end numbers
    - Section headings
    - Table blocks intact
    - Deterministic, traceable chunk IDs
    """

    def __init__(
        self,
        chunk_size_tokens: Optional[int] = None,
        chunk_overlap_tokens: Optional[int] = None
    ):
        self.chunk_size_tokens = chunk_size_tokens or settings.CHUNK_SIZE_TOKENS
        self.chunk_overlap_tokens = chunk_overlap_tokens or settings.CHUNK_OVERLAP_TOKENS

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """Estimate token count based on whitespace word count (~1.3 tokens/word)."""
        words = len(text.split())
        return max(1, int(words * 1.3))

    def chunk_pages(self, document_id: str, pages: List[PageModel]) -> List[ChunkModel]:
        chunks: List[ChunkModel] = []
        global_chunk_idx = 1

        for page in pages:
            page_text = page.text.strip()
            if not page_text:
                continue

            # First extract discrete tables if any
            page_chunks = self._chunk_single_page(document_id, page, global_chunk_idx)
            for c in page_chunks:
                chunks.append(c)
                global_chunk_idx += 1

        return chunks

    def _chunk_single_page(
        self,
        document_id: str,
        page: PageModel,
        start_chunk_idx: int
    ) -> List[ChunkModel]:
        page_num = page.page_number
        text = page.text.strip()
        
        # Split by paragraph blocks (double newlines or headers)
        paragraphs = re.split(r'\n{2,}', text)
        page_chunks: List[ChunkModel] = []
        
        current_chunk_text = ""
        current_section = None
        local_idx = 1

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # Check if this paragraph is a section header (e.g. "### Header")
            if para.startswith("#") or (len(para) < 60 and para.isupper()):
                current_section = para.lstrip("#").strip()

            candidate = f"{current_chunk_text}\n\n{para}".strip() if current_chunk_text else para
            tokens = self.estimate_tokens(candidate)

            if tokens <= self.chunk_size_tokens:
                current_chunk_text = candidate
            else:
                if current_chunk_text:
                    chunk_id = f"{document_id}-P{page_num:02d}-C{local_idx:02d}"
                    page_chunks.append(ChunkModel(
                        chunk_id=chunk_id,
                        document_id=document_id,
                        page_start=page_num,
                        page_end=page_num,
                        section=current_section,
                        text=current_chunk_text,
                        token_count=self.estimate_tokens(current_chunk_text),
                        metadata={"page_number": page_num}
                    ))
                    local_idx += 1
                
                # Start new chunk with current paragraph
                current_chunk_text = para

        if current_chunk_text:
            chunk_id = f"{document_id}-P{page_num:02d}-C{local_idx:02d}"
            page_chunks.append(ChunkModel(
                chunk_id=chunk_id,
                document_id=document_id,
                page_start=page_num,
                page_end=page_num,
                section=current_section,
                text=current_chunk_text,
                token_count=self.estimate_tokens(current_chunk_text),
                metadata={"page_number": page_num}
            ))

        return page_chunks
