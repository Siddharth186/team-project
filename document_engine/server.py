from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.routes import router

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="NEXUS AI - Member 1 Document Intelligence Engine (Ingestion, Parsing, OCR, Chunking, AI Extraction)",
        version="0.1.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router)

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("document_engine.server:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
