from pathlib import Path
from typing import Dict, Type
from .base import BaseParser
from .pdf_parser import PDFParser
from .docx_parser import DOCXParser
from .spreadsheet_parser import SpreadsheetParser
from .text_parser import TextParser
from .image_parser import ImageParser
from ..ocr.manager import OCRManager

class ParserFactory:
    """Factory to retrieve the appropriate parser instance for a given file type or extension."""

    def __init__(self, ocr_manager: OCRManager = None):
        self.ocr_manager = ocr_manager or OCRManager()
        self._pdf_parser = PDFParser(ocr_manager=self.ocr_manager)
        self._docx_parser = DOCXParser()
        self._spreadsheet_parser = SpreadsheetParser()
        self._text_parser = TextParser()
        self._image_parser = ImageParser(ocr_manager=self.ocr_manager)

    def get_parser(self, file_type: str) -> BaseParser:
        ft = file_type.lower().strip()
        if ft == "pdf":
            return self._pdf_parser
        elif ft == "docx":
            return self._docx_parser
        elif ft in ("xlsx", "xls", "csv"):
            return self._spreadsheet_parser
        elif ft in ("txt", "text", "md", "log", "json"):
            return self._text_parser
        elif ft in ("image", "png", "jpg", "jpeg", "tiff", "bmp", "webp"):
            return self._image_parser
        else:
            # Fallback to text parser if text-like or unknown
            return self._text_parser

    def get_parser_for_filename(self, filename: str) -> BaseParser:
        ext = Path(filename).suffix.lower()
        if ext == ".pdf":
            return self._pdf_parser
        elif ext == ".docx":
            return self._docx_parser
        elif ext in (".xlsx", ".xls", ".csv"):
            return self._spreadsheet_parser
        elif ext in (".txt", ".md", ".log", ".json"):
            return self._text_parser
        elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"):
            return self._image_parser
        else:
            return self._text_parser
