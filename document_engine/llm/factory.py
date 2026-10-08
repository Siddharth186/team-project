import logging
from typing import Optional
from .base import LLMProvider
from .gemini_provider import GeminiLLMProvider
from .openai_provider import OpenAILLMProvider
from .ollama_provider import OllamaLLMProvider
from .deterministic_provider import DeterministicLLMProvider
from ..config import settings

logger = logging.getLogger(__name__)

class LLMProviderFactory:
    """Factory to instantiate and resolve configured LLM providers with reliable fallback."""

    @staticmethod
    def get_provider(provider_name: Optional[str] = None) -> LLMProvider:
        p_name = (provider_name or settings.LLM_PROVIDER).lower().strip()

        if p_name == "gemini":
            if settings.GEMINI_API_KEY:
                return GeminiLLMProvider()
            else:
                logger.warning("Gemini requested but GEMINI_API_KEY is not set. Falling back to Deterministic Provider.")
                return DeterministicLLMProvider()

        elif p_name in ("openai", "groq", "deepseek"):
            if settings.OPENAI_API_KEY:
                return OpenAILLMProvider()
            else:
                logger.warning("OpenAI requested but OPENAI_API_KEY is not set. Falling back to Deterministic Provider.")
                return DeterministicLLMProvider()

        elif p_name == "ollama":
            return OllamaLLMProvider()

        elif p_name in ("deterministic", "mock", "rule"):
            return DeterministicLLMProvider()

        # Default fallback
        if settings.GEMINI_API_KEY:
            return GeminiLLMProvider()
        elif settings.OPENAI_API_KEY:
            return OpenAILLMProvider()
        else:
            return DeterministicLLMProvider()
