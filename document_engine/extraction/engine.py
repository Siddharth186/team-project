import logging
from typing import List, Dict, Any, Tuple
from ..schemas.document import DocumentModel, PageModel, ChunkModel
from ..schemas.extraction import (
    ExtractedEntity,
    ExtractedFact,
    ExtractedRelationship,
    SourceEvidence,
    ChunkExtractionOutput
)
from ..llm.base import LLMProvider
from ..llm.factory import LLMProviderFactory
from ..llm.deterministic_provider import DeterministicLLMProvider
from .prompts import EXTRACTION_SYSTEM_PROMPT, build_chunk_extraction_prompt
from .validator import ExtractionValidator

logger = logging.getLogger(__name__)

class ExtractionEngine:
    """
    Core Information Intelligence Extraction Engine.
    Processes document chunks through LLM interpreters with prompt injection guards,
    strict validation, and verifiable provenance tracking.
    """

    def __init__(self, llm_provider: LLMProvider = None):
        self.llm_provider = llm_provider or LLMProviderFactory.get_provider()

    def extract_from_chunks(
        self,
        document_id: str,
        chunks: List[ChunkModel]
    ) -> Tuple[List[ExtractedEntity], List[ExtractedFact], List[ExtractedRelationship], List[SourceEvidence]]:
        all_entities: List[ExtractedEntity] = []
        all_facts: List[ExtractedFact] = []
        all_relationships: List[ExtractedRelationship] = []
        all_evidence: List[SourceEvidence] = []

        for chunk in chunks:
            if not chunk.text.strip():
                continue

            user_prompt = build_chunk_extraction_prompt(
                document_id=document_id,
                page_number=chunk.page_start,
                chunk_id=chunk.chunk_id,
                chunk_text=chunk.text,
                section=chunk.section
            )

            raw_output = None
            try:
                raw_output = self.llm_provider.generate_json(
                    system_prompt=EXTRACTION_SYSTEM_PROMPT,
                    user_prompt=user_prompt
                )
            except Exception as e:
                logger.warning(f"LLM extraction failed on chunk {chunk.chunk_id} ({e}). Falling back to Deterministic Rule Extractor.")
                try:
                    fallback = DeterministicLLMProvider()
                    raw_output = fallback.generate_json(
                        system_prompt=EXTRACTION_SYSTEM_PROMPT,
                        user_prompt=user_prompt
                    )
                except Exception as fe:
                    logger.error(f"Fallback extraction failed on chunk {chunk.chunk_id}: {fe}")
                    raw_output = {}

            validated_output = ExtractionValidator.validate_and_repair(
                raw_output=raw_output,
                expected_doc_id=document_id,
                expected_page_num=chunk.page_start,
                expected_chunk_id=chunk.chunk_id,
                chunk_text=chunk.text
            )

            all_entities.extend(validated_output.entities)
            all_facts.extend(validated_output.facts)
            all_relationships.extend(validated_output.relationships)
            all_evidence.extend(validated_output.evidence)

        # Deduplicate evidence references by exact source text & location
        unique_evidence: List[SourceEvidence] = []
        seen_ev = set()
        for ev in all_evidence:
            k = (ev.document_id, ev.page_number, ev.chunk_id, ev.source_text)
            if k not in seen_ev:
                seen_ev.add(k)
                unique_evidence.append(ev)

        return all_entities, all_facts, all_relationships, unique_evidence
