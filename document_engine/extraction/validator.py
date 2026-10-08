import json
import logging
import uuid
from typing import Dict, Any, Tuple, Optional
from ..schemas.extraction import (
    ChunkExtractionOutput,
    ExtractedEntity,
    ExtractedFact,
    ExtractedRelationship,
    SourceEvidence
)

logger = logging.getLogger(__name__)

class ExtractionValidator:
    """Validates, sanitizes, and repairs structured extraction outputs."""

    @staticmethod
    def validate_and_repair(
        raw_output: Any,
        expected_doc_id: str,
        expected_page_num: int,
        expected_chunk_id: str,
        chunk_text: str
    ) -> ChunkExtractionOutput:
        """
        Validates raw dictionary or json string, repairs missing IDs or provenance fields,
        and constructs a fully validated ChunkExtractionOutput.
        """
        if isinstance(raw_output, str):
            try:
                raw_output = json.loads(raw_output)
            except Exception as e:
                logger.warning(f"Failed to parse json string from LLM: {e}")
                raw_output = {"entities": [], "facts": [], "relationships": [], "evidence": []}

        if not isinstance(raw_output, dict):
            raw_output = {"entities": [], "facts": [], "relationships": [], "evidence": []}

        # Repair entities
        valid_entities = []
        for ent in raw_output.get("entities", []):
            try:
                if not isinstance(ent, dict) or not ent.get("value"):
                    continue
                ent_id = ent.get("entity_id") or f"ENT-{uuid.uuid4().hex[:8]}"
                src = ent.get("source") or {}
                source_obj = SourceEvidence(
                    document_id=src.get("document_id") or expected_doc_id,
                    page_number=src.get("page_number") or expected_page_num,
                    chunk_id=src.get("chunk_id") or expected_chunk_id,
                    source_text=str(src.get("source_text") or ent["value"])
                )
                valid_entities.append(ExtractedEntity(
                    entity_id=ent_id,
                    type=str(ent.get("type", "MISC")).upper(),
                    value=str(ent["value"]).strip(),
                    source=source_obj,
                    confidence=float(ent.get("confidence", 0.95)),
                    metadata=ent.get("metadata") or {}
                ))
            except Exception as ee:
                logger.debug(f"Skipping malformed entity: {ee}")

        # Repair facts
        valid_facts = []
        for fact in raw_output.get("facts", []):
            try:
                if not isinstance(fact, dict) or not fact.get("attribute"):
                    continue
                fct_id = fact.get("fact_id") or f"FCT-{uuid.uuid4().hex[:8]}"
                src = fact.get("source") or {}
                src_text = str(src.get("source_text") or f"{fact.get('attribute')}: {fact.get('value')}")
                source_obj = SourceEvidence(
                    document_id=src.get("document_id") or expected_doc_id,
                    page_number=src.get("page_number") or expected_page_num,
                    chunk_id=src.get("chunk_id") or expected_chunk_id,
                    source_text=src_text
                )
                valid_facts.append(ExtractedFact(
                    fact_id=fct_id,
                    entity_reference=str(fact.get("entity_reference", "Unknown")).strip(),
                    attribute=str(fact["attribute"]).strip().lower().replace(" ", "_"),
                    value=fact.get("value"),
                    value_type=str(fact.get("value_type", "string")).lower(),
                    unit=fact.get("unit"),
                    valid_from=fact.get("valid_from"),
                    valid_to=fact.get("valid_to"),
                    source=source_obj,
                    extraction_confidence=float(fact.get("extraction_confidence", 0.95)),
                    metadata=fact.get("metadata") or {}
                ))
            except Exception as fe:
                logger.debug(f"Skipping malformed fact: {fe}")

        # Repair relationships
        valid_rels = []
        for rel in raw_output.get("relationships", []):
            try:
                if not isinstance(rel, dict) or not rel.get("source_entity") or not rel.get("target_entity"):
                    continue
                rel_id = rel.get("relationship_id") or f"REL-{uuid.uuid4().hex[:8]}"
                src = rel.get("source") or {}
                source_obj = SourceEvidence(
                    document_id=src.get("document_id") or expected_doc_id,
                    page_number=src.get("page_number") or expected_page_num,
                    chunk_id=src.get("chunk_id") or expected_chunk_id,
                    source_text=str(src.get("source_text") or f"{rel.get('source_entity')} -> {rel.get('target_entity')}")
                )
                valid_rels.append(ExtractedRelationship(
                    relationship_id=rel_id,
                    source_entity=str(rel["source_entity"]).strip(),
                    relationship_type=str(rel.get("relationship_type", "related_to")).lower(),
                    target_entity=str(rel["target_entity"]).strip(),
                    source=source_obj,
                    confidence=float(rel.get("confidence", 0.95)),
                    metadata=rel.get("metadata") or {}
                ))
            except Exception as re_err:
                logger.debug(f"Skipping malformed relationship: {re_err}")

        # Evidence collection
        valid_evidence = []
        for ev in raw_output.get("evidence", []):
            try:
                if isinstance(ev, dict) and ev.get("source_text"):
                    valid_evidence.append(SourceEvidence(
                        document_id=ev.get("document_id") or expected_doc_id,
                        page_number=ev.get("page_number") or expected_page_num,
                        chunk_id=ev.get("chunk_id") or expected_chunk_id,
                        source_text=str(ev["source_text"]).strip()
                    ))
            except Exception:
                pass

        # If evidence list was empty in LLM output, collect from extracted facts/entities
        if not valid_evidence:
            for f in valid_facts:
                valid_evidence.append(f.source)
            for e in valid_entities:
                valid_evidence.append(e.source)

        return ChunkExtractionOutput(
            entities=valid_entities,
            facts=valid_facts,
            relationships=valid_rels,
            evidence=valid_evidence
        )
