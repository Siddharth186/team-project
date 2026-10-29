import re
import json
import logging
import httpx
from typing import Dict, Any, Optional
from .base import LLMProvider
from ..config import settings

logger = logging.getLogger(__name__)

def strip_thinking(text: str) -> str:
    """Strip <think>...</think> blocks produced by reasoning models."""
    if not text or not isinstance(text, str):
        return ""
    return re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.DOTALL).strip()

def safe_extract_json(raw_text: str) -> Dict[str, Any]:
    """Tolerates code fences, stray text, and thinking tokens to extract valid JSON."""
    if not raw_text or not isinstance(raw_text, str):
        raise ValueError("Empty or invalid LLM response")

    cleaned = strip_thinking(raw_text)

    # Strip markdown code fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    # Try direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as initial_err:
        first_curly = cleaned.find("{")
        last_curly = cleaned.rfind("}")
        first_square = cleaned.find("[")
        last_square = cleaned.rfind("]")

        candidate = ""
        if first_curly != -1 and last_curly != -1 and (first_square == -1 or first_curly < first_square):
            candidate = cleaned[first_curly:last_curly + 1]
        elif first_square != -1 and last_square != -1:
            candidate = cleaned[first_square:last_square + 1]
        else:
            raise initial_err

        return json.loads(candidate)

class OllamaLLMProvider(LLMProvider):
    """Local Ollama LLM provider with robust <think> stripping, structured JSON, and fallback resilience."""

    def __init__(self, base_url: Optional[str] = None, model_name: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model_name = model_name or settings.OLLAMA_MODEL
        self.num_ctx = settings.OLLAMA_NUM_CTX
        self.temperature = settings.OLLAMA_TEMP_EXTRACTION

    def get_provider_name(self) -> str:
        return f"ollama ({self.model_name})"

    def check_health(self) -> Dict[str, Any]:
        """Check Ollama connectivity and whether the selected model is pulled."""
        try:
            with httpx.Client(timeout=4.0) as client:
                resp = client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    models = [m.get("name", "").lower() for m in resp.json().get("models", [])]
                    base_model = self.model_name.lower().split(":")[0]
                    has_model = any(self.model_name.lower() in m or m.startswith(base_model) for m in models)
                    if not has_model:
                        logger.warning(
                            f"[OLLAMA WARNING] Model '{self.model_name}' is not installed in Ollama. "
                            f"Run: ollama pull {self.model_name}"
                        )
                    return {"running": True, "has_model": has_model, "installed_models": models}
        except Exception as e:
            logger.warning(f"[OLLAMA WARNING] Ollama is not reachable at {self.base_url}: {e}")
        return {"running": False, "has_model": False, "installed_models": []}

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model_name,
            "system": system_prompt,
            "prompt": user_prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "num_ctx": self.num_ctx,
                "think": False
            }
        }

        try:
            with httpx.Client(timeout=60.0) as client:
                resp = client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()
                raw_response = data.get("response", "")

                try:
                    return safe_extract_json(raw_response)
                except Exception as parse_err:
                    logger.warning(f"Initial JSON parse failed for {self.model_name} ({parse_err}). Attempting repair retry.")
                    # Retry once with repair prompt
                    repair_payload = {
                        "model": self.model_name,
                        "prompt": (
                            "You must repair the following output so it is strictly valid JSON conforming to the original schema. "
                            "Do not include markdown code blocks, preamble, explanation, or thinking tokens. Output pure JSON only:\n"
                            + raw_response
                        ),
                        "format": "json",
                        "stream": False,
                        "options": {
                            "temperature": 0.0,
                            "num_ctx": self.num_ctx,
                            "think": False
                        }
                    }
                    repair_resp = client.post(url, json=repair_payload)
                    repair_resp.raise_for_status()
                    repaired_data = repair_resp.json()
                    return safe_extract_json(repaired_data.get("response", ""))

        except httpx.ConnectError as ce:
            logger.warning(f"Ollama connection refused at {self.base_url}. Ensure Ollama is running (`ollama serve`). Error: {ce}")
            raise
        except Exception as e:
            logger.warning(f"Ollama generation failed ({e}). Escalating to fallback provider.")
            raise
