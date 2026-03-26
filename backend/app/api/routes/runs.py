from fastapi import APIRouter, HTTPException

from app.data.mock_store import RUN_COMPARISONS, RUN_DETAILS, RUN_STATUSES
from app.schemas.cases import CaseActionResponse
from app.schemas.runs import RunCompareResponse, RunDetailResponse, RunStatusResponse

router = APIRouter()


@router.get("/runs/{run_id}", response_model=RunDetailResponse)
async def get_run(run_id: str) -> RunDetailResponse:
    run = RUN_DETAILS.get(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    return run


@router.get("/runs/{run_id}/status", response_model=RunStatusResponse)
async def get_run_status(run_id: str) -> RunStatusResponse:
    status = RUN_STATUSES.get(run_id)
    if status is None:
        raise HTTPException(status_code=404, detail=f"Run status for {run_id} not found")
    return status


@router.post("/runs/{run_id}/replay", response_model=CaseActionResponse)
async def replay_run(run_id: str) -> CaseActionResponse:
    run = RUN_DETAILS.get(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    return CaseActionResponse(
        case_id=run.run.case_id,
        status="running",
        message=f"Replay started for {run.run.customer_name}.",
    )


@router.get("/runs/{run_id}/compare", response_model=RunCompareResponse)
async def compare_runs(run_id: str) -> RunCompareResponse:
    comparison = RUN_COMPARISONS.get(run_id)
    if comparison is None:
        raise HTTPException(status_code=404, detail=f"Run comparison for {run_id} not found")
    return comparison
