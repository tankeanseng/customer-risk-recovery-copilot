from fastapi import APIRouter
from fastapi import HTTPException

from app.data.mock_store import CASE_DETAILS
from app.schemas.cases import CaseDetailResponse

router = APIRouter()


@router.get("/cases")
async def list_cases() -> dict[str, str]:
    return {"message": "TODO: implement cases list endpoint"}


@router.post("/cases")
async def create_case() -> dict[str, str]:
    return {"message": "TODO: implement create case endpoint"}


@router.get("/cases/{case_id}", response_model=CaseDetailResponse)
async def get_case(case_id: str) -> CaseDetailResponse:
    case = CASE_DETAILS.get(case_id)
    if case is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return CaseDetailResponse(case_id=case_id, **case)


@router.post("/cases/{case_id}/runs")
async def create_case_run(case_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement case run endpoint for {case_id}"}


@router.post("/cases/{case_id}/approval-requests")
async def create_approval_request(case_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement approval request endpoint for {case_id}"}


@router.get("/cases/{case_id}/brief/export")
async def export_case_brief(case_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement brief export endpoint for {case_id}"}
