from fastapi import APIRouter

from app.data.mock_store import PORTFOLIO_DATA
from app.schemas.portfolio import PortfolioResponse

router = APIRouter()


@router.get("/portfolio", response_model=PortfolioResponse)
async def get_portfolio() -> PortfolioResponse:
    return PORTFOLIO_DATA
