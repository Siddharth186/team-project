import os
import json
from pathlib import Path
from typing import Dict, Optional, List
from .validator import IngestionValidator
from ..schemas.document import DocumentModel
from ..config import settings

class IngestionManager:
    """Manages document uploads, disk storage, hash registry, and duplicate detection."""

    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = storage_dir or settings.STORAGE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._registry: Dict[str, DocumentModel] = {} # document_id -> DocumentModel
        self._hash_index: Dict[str, str] = {} # content_hash -> document_id
        self._raw_file_paths: Dict[str, Path] = {} # document_id -> local raw file path
        self._load_registry()

    def _registry_path(self) -> Path:
        return self.storage_dir / "registry.json"

    def _load_registry(self):
        reg_file = self._registry_path()
        if reg_file.exists():
            try:
                with open(reg_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for item in data:
                        doc = DocumentModel(**item)
                        self._registry[doc.document_id] = doc
                        self._hash_index[doc.content_hash] = doc.document_id
                        # check if file path exists
                        file_path = self.storage_dir / doc.document_id / doc.filename
                        if file_path.exists():
                            self._raw_file_paths[doc.document_id] = file_path
            except Exception:
                pass

    def _save_registry(self):
        reg_file = self._registry_path()
        try:
            with open(reg_file, "w", encoding="utf-8") as f:
                json.dump([doc.model_dump() for doc in self._registry.values()], f, indent=2)
        except Exception:
            pass

    def ingest_bytes(self, filename: str, file_bytes: bytes, allow_duplicate: bool = False) -> DocumentModel:
        """
        Validate, hash, and register incoming raw document bytes.
        If duplicate exists and allow_duplicate is False, returns existing DocumentModel.
        """
        classification = IngestionValidator.validate_and_classify(filename, file_bytes)
        content_hash = classification["content_hash"]

        if not allow_duplicate and content_hash in self._hash_index:
            existing_doc_id = self._hash_index[content_hash]
            if existing_doc_id in self._registry:
                existing_doc = self._registry[existing_doc_id]
                existing_doc.metadata["is_duplicate"] = True
                return existing_doc

        doc = DocumentModel(
            filename=classification["filename"],
            file_type=classification["file_type"],
            file_size=classification["file_size"],
            content_hash=content_hash,
            status="pending",
            metadata={"extension": classification["extension"]}
        )

        doc_dir = self.storage_dir / doc.document_id
        doc_dir.mkdir(parents=True, exist_ok=True)
        file_path = doc_dir / filename
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        self._registry[doc.document_id] = doc
        self._hash_index[doc.content_hash] = doc.document_id
        self._raw_file_paths[doc.document_id] = file_path
        self._save_registry()

        return doc

    def get_document(self, document_id: str) -> Optional[DocumentModel]:
        return self._registry.get(document_id)

    def get_file_path(self, document_id: str) -> Optional[Path]:
        return self._raw_file_paths.get(document_id)

    def list_documents(self) -> List[DocumentModel]:
        return list(self._registry.values())

    def update_document(self, doc: DocumentModel):
        self._registry[doc.document_id] = doc
        self._save_registry()
