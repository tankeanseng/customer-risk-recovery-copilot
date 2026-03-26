from fastapi import APIRouter

from app.data.mock_store import TRIAGE_RULES
from app.schemas.cases import TriageRulesResponse

router = APIRouter()


@router.get("/triage/rules", response_model=TriageRulesResponse)
async def get_triage_rules() -> TriageRulesResponse:
    return TRIAGE_RULES
