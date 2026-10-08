import io
import csv
import logging
from typing import List, Dict, Any, Tuple
import pandas as pd
from .base import BaseParser
from ..schemas.document import PageModel, TableModel

logger = logging.getLogger(__name__)

class SpreadsheetParser(BaseParser):
    """Parses Excel (.xlsx, .xls) and CSV (.csv) files into tabular pages and structured markdown."""

    def parse(self, file_bytes: bytes, filename: str, document_id: str) -> Tuple[List[PageModel], Dict[str, Any]]:
        is_csv = filename.lower().endswith(".csv")
        pages: List[PageModel] = []
        doc_metadata: Dict[str, Any] = {
            "parser": "SpreadsheetParser",
            "format": "csv" if is_csv else "excel"
        }

        if is_csv:
            # Parse CSV
            try:
                # Detect encoding & delimiter
                text_content = file_bytes.decode("utf-8", errors="replace")
                df = pd.read_csv(io.StringIO(text_content))
            except Exception as e:
                logger.warning(f"Pandas CSV failed ({e}), falling back to standard csv module...")
                text_content = file_bytes.decode("utf-8", errors="replace")
                reader = csv.reader(io.StringIO(text_content))
                rows_list = list(reader)
                headers = rows_list[0] if rows_list else []
                data_rows = rows_list[1:] if len(rows_list) > 1 else []
                df = pd.DataFrame(data_rows, columns=headers)

            page = self._dataframe_to_page(df, sheet_name="Sheet1", page_num=1, document_id=document_id)
            pages.append(page)
            doc_metadata["sheets_count"] = 1
            doc_metadata["page_count"] = 1

        else:
            # Parse Excel with openpyxl / pandas
            excel_file = io.BytesIO(file_bytes)
            xls = pd.ExcelFile(excel_file)
            sheet_names = xls.sheet_names

            for idx, sheet in enumerate(sheet_names):
                df = pd.read_excel(xls, sheet_name=sheet)
                page = self._dataframe_to_page(df, sheet_name=sheet, page_num=idx + 1, document_id=document_id)
                pages.append(page)

            doc_metadata["sheets"] = sheet_names
            doc_metadata["sheets_count"] = len(sheet_names)
            doc_metadata["page_count"] = len(sheet_names)

        return pages, doc_metadata

    def _dataframe_to_page(self, df: pd.DataFrame, sheet_name: str, page_num: int, document_id: str) -> PageModel:
        # Fill NaN values
        df_clean = df.fillna("")
        headers = [str(c) for c in df_clean.columns]
        rows = [[str(val) for val in row] for row in df_clean.values.tolist()]

        # Generate Markdown Table
        md_lines = [f"### Sheet / Table: {sheet_name}\n"]
        if headers:
            md_lines.append("| " + " | ".join(headers) + " |")
            md_lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
            for r in rows:
                md_lines.append("| " + " | ".join(r) + " |")
        markdown_table = "\n".join(md_lines)

        table_model = TableModel(
            page_number=page_num,
            headers=headers,
            rows=rows,
            markdown=markdown_table,
            metadata={"sheet_name": sheet_name, "row_count": len(rows), "col_count": len(headers)}
        )

        return PageModel(
            document_id=document_id,
            page_number=page_num,
            text=markdown_table,
            tables=[table_model],
            metadata={
                "sheet_name": sheet_name,
                "row_count": len(rows),
                "col_count": len(headers),
                "char_count": len(markdown_table)
            }
        )
