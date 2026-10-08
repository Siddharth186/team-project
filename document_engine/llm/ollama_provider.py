import json
import logging
import httpx
from typing import Dict, Any, Optional
from .base import LLMProvider
from ..config import settings

logger = logging.getLogger(__name__)

class OllamaLLMProvider(LLMProvider):
    """Local Ollama LLM provider."""

    def __init__(self, base_url: Optional[str] = None, model_name: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model_name = model_name or settings.OLLAMA_MODEL

    def get_provider_name(self) -> str:
        return f"ollama ({self.model_name})"

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model_name,
            "system": system_prompt,
            "prompt": user_prompt,
            "format": "json",
            "stream": False,
            "options": {"temperature": 0.1}
        }

        with httpx.Client(timeout=90.0) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return json.loads(data["response"])
