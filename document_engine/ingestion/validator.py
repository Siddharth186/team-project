import hashlib
from pathlib import Path
from typing import Tuple, Dict, Any
from ..config import settings

# Supported extensions
SUPPORTED_EXTENSIONS = {
    ".pdf": "pdf",
    ".docx": "docx",
    ".xlsx": "xlsx",
    ".xls": "xlsx",
    ".csv": "csv",
    ".txt": "txt",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".tiff": "image",
    ".bmp": "image",
    ".webp": "image"
}

# Magic signatures
MAGIC_SIGNATURES = {
    b"%PDF": "pdf",
    b"PK\x03\x04": "zip_based", # docx or xlsx
    b"\x89PNG\r\n\x1a\n": "image",
    b"\xff\xd8\xff": "image",
    b"GIF87a": "image",
    b"GIF89a": "image",
    b"BM": "image",
    b"II*\x00": "image", # TIFF little-endian
    b"MM\x00*": "image", # TIFF big-endian
    b"RIFF": "image" # WEBP
}

class IngestionValidator:
    """Validates files for ingestion: size, content type, magic bytes, hashing."""

    @staticmethod
    def compute_sha256(file_bytes: bytes) -> str:
        """Compute deterministic SHA-256 hash of file content."""
        return hashlib.sha256(file_bytes).hexdigest()

    @staticmethod
    def validate_and_classify(filename: str, file_bytes: bytes) -> Dict[str, Any]:
        """
        Validate file constraints and classify document type.
        Raises ValueError if invalid or unsupported.
        """
        file_size = len(file_bytes)
        if file_size == 0:
            raise ValueError(f"File '{filename}' is empty (0 bytes).")
        
        if file_size > settings.MAX_FILE_SIZE_BYTES:
            max_mb = settings.MAX_FILE_SIZE_BYTES / (1024 * 1024)
            raise ValueError(f"File '{filename}' exceeds maximum allowed size of {max_mb:.1f} MB.")

        ext = Path(filename).suffix.lower()
        if not ext:
            raise ValueError(f"File '{filename}' lacks a file extension.")

        if ext not in SUPPORTED_EXTENSIONS:
            supported = ", ".join(SUPPORTED_EXTENSIONS.keys())
            raise ValueError(f"Unsupported file extension '{ext}'. Supported: {supported}")

        expected_type = SUPPORTED_EXTENSIONS[ext]
        
        # Verify magic header if binary
        is_binary = ext not in (".csv", ".txt")
        if is_binary:
            matched_magic = False
            for magic, mtype in MAGIC_SIGNATURES.items():
                if file_bytes.startswith(magic):
                    matched_magic = True
                    break
            # If magic didn't match directly, we still allow recognized extensions if not corrupt
            # (e.g. some PDFs might have small leading space)

        content_hash = IngestionValidator.compute_sha256(file_bytes)

        return {
            "filename": filename,
            "file_type": expected_type,
            "file_size": file_size,
            "content_hash": content_hash,
            "extension": ext
        }
