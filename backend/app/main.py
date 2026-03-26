from fastapi import FastAPI

from app.api.router import api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Customer Risk & Recovery Copilot API",
        version="0.1.0",
        description="Backend API for the Customer Risk & Recovery Copilot demo application.",
    )
    app.include_router(api_router, prefix="/api")

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

