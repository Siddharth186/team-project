import os
from pathlib import Path
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    # App info
    APP_NAME: str = "NEXUS AI - Document Intelligence Engine"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = Field(default_factory=lambda: os.getenv("DEBUG", "false").lower() in ("true", "1", "yes"))
    
    # Storage
    STORAGE_DIR: Path = Field(default_factory=lambda: Path(os.getenv("STORAGE_DIR", "./data/documents")).resolve())
    MAX_FILE_SIZE_BYTES: int = Field(default_factory=lambda: int(os.getenv("MAX_FILE_SIZE_BYTES", str(100 * 1024 * 1024)))) # 100 MB
    
    # LLM Settings
    LLM_PROVIDER: str = Field(default_factory=lambda: os.getenv("LLM_PROVIDER", "gemini"))
    GEMINI_API_KEY: str = Field(default_factory=lambda: os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")))
    GEMINI_MODEL: str = Field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))
    OPENAI_API_KEY: str = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    OPENAI_MODEL: str = Field(default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
    OPENAI_BASE_URL: str = Field(default_factory=lambda: os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"))
    OLLAMA_BASE_URL: str = Field(default_factory=lambda: os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"))
    OLLAMA_MODEL: str = Field(default_factory=lambda: os.getenv("OLLAMA_MODEL", "llama3"))
    
    # OCR Settings
    OCR_PROVIDER: str = Field(default_factory=lambda: os.getenv("OCR_PROVIDER", "auto")) # auto, winrt, tesseract, mock
    OCR_MIN_TEXT_CHARS: int = Field(default_factory=lambda: int(os.getenv("OCR_MIN_TEXT_CHARS", "40"))) # min chars per page before triggering OCR
    
    # Chunking Settings
    CHUNK_SIZE_TOKENS: int = Field(default_factory=lambda: int(os.getenv("CHUNK_SIZE_TOKENS", "500")))
    CHUNK_OVERLAP_TOKENS: int = Field(default_factory=lambda: int(os.getenv("CHUNK_OVERLAP_TOKENS", "50")))
    
    # Server Settings
    HOST: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    PORT: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))

settings = Settings()
