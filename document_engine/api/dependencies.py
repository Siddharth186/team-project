from functools import lru_cache
from ..pipeline import DocumentIntelligenceEngine

@lru_cache()
def get_engine() -> DocumentIntelligenceEngine:
    return DocumentIntelligenceEngine()
