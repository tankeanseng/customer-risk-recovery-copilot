import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.router import api_router


load_dotenv()


def create_app() -> FastAPI:
    frontend_origins = os.getenv("FRONTEND_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000").split(",")
    app = FastAPI(
        title="Customer Risk & Recovery Copilot API",
        version="0.1.0",
        description="Backend API for the Customer Risk & Recovery Copilot demo application.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in frontend_origins if origin.strip()],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix="/api")

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
