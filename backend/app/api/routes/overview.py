from fastapi import APIRouter

from app.data.mock_store import OVERVIEW_DATA
from app.schemas.overview import OverviewResponse

router = APIRouter()


@router.get("/overview", response_model=OverviewResponse)
async def get_overview() -> OverviewResponse:
    return OVERVIEW_DATA
