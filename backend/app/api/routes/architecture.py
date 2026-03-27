from fastapi import APIRouter

from app.schemas.architecture import ArchitectureResponse
from app.services.architecture_view import get_architecture_view

router = APIRouter()


@router.get("/architecture", response_model=ArchitectureResponse)
async def get_architecture() -> ArchitectureResponse:
    return get_architecture_view()
