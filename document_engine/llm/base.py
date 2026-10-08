from abc import ABC, abstractmethod
from typing import Dict, Any, Type, Optional
from pydantic import BaseModel

class LLMProvider(ABC):
    """Abstract interface for LLM backends."""

    @abstractmethod
    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """
        Send system and user prompts to LLM and return parsed JSON dictionary.
        """
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier name."""
        pass
