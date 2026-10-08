from typing import List, Dict, Any, Tuple
from ..schemas.document import DocumentModel, PageModel, TableModel

class DocumentNormalizer:
    """Normalizes parsed pages, tables, and metadata into canonical Document representation."""

    @staticmethod
    def normalize(
        doc: DocumentModel,
        pages: List[PageModel],
        parser_metadata: Dict[str, Any]
    ) -> DocumentModel:
        """
        Populate document-level properties, page counts, and summary statistics.
        """
        doc.page_count = len(pages)
        total_chars = sum(len(p.text) for p in pages)
        total_tables = sum(len(p.tables) for p in pages)
        scanned_pages = sum(1 for p in pages if p.has_scanned_content or p.ocr_applied)

        doc.metadata.update(parser_metadata)
        doc.metadata["total_chars"] = total_chars
        doc.metadata["total_tables"] = total_tables
        doc.metadata["scanned_pages"] = scanned_pages
        doc.status = "parsed"

        return doc
