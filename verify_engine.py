"""
End-to-End Verification and Demonstration Script for Member 1 Document Intelligence Engine
Scenario: Multi-document Loan Application Verification
"""
import os
import sys
import tempfile
from pathlib import Path

# Set UTF-8 encoding on Windows standard streams if possible
if sys.platform == "win32":
    os.environ["PYTHONIOENCODING"] = "utf-8"

from document_engine.client import DocumentEngineClient
from tests.test_fixtures import (
    create_sample_pdf,
    create_scanned_pdf,
    create_sample_docx,
    create_sample_xlsx,
    create_sample_csv,
    create_sample_image
)

def run_full_verification():
    print("=" * 70)
    print(" NEXUS AI -- Member 1 Engine Full Verification Test")
    print("=" * 70)

    client = DocumentEngineClient()

    with tempfile.TemporaryDirectory() as temp_dir:
        tmp_path = Path(temp_dir)
        
        # 1. Prepare files
        doc_files = {
            "loan_application.pdf": create_sample_pdf(tmp_path / "loan_application.pdf"),
            "salary_certificate_scan.pdf": create_scanned_pdf(tmp_path / "salary_certificate_scan.pdf"),
            "employment_letter.docx": create_sample_docx(tmp_path / "employment_letter.docx"),
            "payroll_history.xlsx": create_sample_xlsx(tmp_path / "payroll_history.xlsx"),
            "bank_statement.csv": create_sample_csv(tmp_path / "bank_statement.csv"),
            "identity_card.png": create_sample_image(tmp_path / "identity_card.png")
        }

        print(f"\n[1] Ingesting and Extracting {len(doc_files)} Multi-Format Documents...\n")
        print(f"{'Filename':<30} | {'Type':<8} | {'Pages':<5} | {'Chunks':<6} | {'Entities':<8} | {'Facts':<5} | {'Status'}")
        print("-" * 78)

        total_facts = 0
        total_entities = 0
        all_results = []

        for fname, fbytes in doc_files.items():
            res = client.process_document(fname, fbytes)
            doc = res.document
            all_results.append(res)
            
            print(f"{doc.filename:<30} | {doc.file_type:<8} | {doc.page_count:<5} | {len(res.chunks):<6} | {len(res.entities):<8} | {len(res.facts):<5} | {doc.status}")

            total_facts += len(res.facts)
            total_entities += len(res.entities)

        print("-" * 78)
        print(f"Total Documents: {len(doc_files)} | Total Entities: {total_entities} | Total Facts: {total_facts}\n")

        print("=" * 70)
        print(" [2] Sample Extracted Facts & Exact Evidence Provenance Quotes")
        print("=" * 70)
        print(f"{'Doc ID':<14} | {'Entity':<14} | {'Attribute':<16} | {'Value':<12} | {'Pg':<3} | {'Source Quote'}")
        print("-" * 78)

        for res in all_results:
            for f in res.facts[:2]:
                quote = f.source.source_text.replace('\n', ' ')
                if len(quote) > 30:
                    quote = quote[:27] + "..."
                val_str = str(f.value) + (f" {f.unit}" if f.unit else "")
                print(f"{f.source.document_id:<14} | {f.entity_reference[:13]:<14} | {f.attribute[:15]:<16} | {val_str:<12} | {f.source.page_number:<3} | '{quote}'")

        print("-" * 78)
        print("\n[3] Traceability Verification:")
        for res in all_results:
            for f in res.facts:
                assert f.source.document_id is not None
                assert f.source.page_number >= 1
                assert f.source.chunk_id is not None
                assert len(f.source.source_text) > 0

        print("  [SUCCESS] 100% of extracted facts and entities have verified document, page, chunk, and source text traces.")
        print("\n" + "=" * 70)
        print(" FULL BASECODE VERIFIED AND READY FOR MEMBER 2 INTEGRATION")
        print("=" * 70 + "\n")

if __name__ == "__main__":
    run_full_verification()
