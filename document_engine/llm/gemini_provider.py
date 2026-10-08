import json
import re
import logging
from typing import Dict, Any, Optional
from .base import LLMProvider
from ..config import settings

logger = logging.getLogger(__name__)

class GeminiLLMProvider(LLMProvider):
    """Google Gemini LLM provider supporting Gemini 1.5 Flash / Pro."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        self._model = None
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            logger.warning("No GEMINI_API_KEY configured for GeminiLLMProvider.")
            return

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self._model = genai.GenerativeModel(
                model_name=self.model_name,
                generation_config={"response_mime_type": "application/json"}
            )
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")

    def get_provider_name(self) -> str:
        return f"gemini ({self.model_name})"

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        if not self._model:
            raise RuntimeError("Gemini LLM Provider is not configured with an API key.")

        combined_prompt = f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER REQUEST:\n{user_prompt}"
        response = self._model.generate_content(combined_prompt)
        text = response.text.strip()
        
        # Clean markdown code block if present
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        return json.loads(text)
