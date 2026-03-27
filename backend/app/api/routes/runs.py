from fastapi import APIRouter, HTTPException

from app.data.mock_store import RUN_COMPARISONS, RUN_DETAILS, RUN_STATUSES
from app.schemas.cases import CaseActionResponse
from app.schemas.runs import RunCompareResponse, RunDetailResponse, RunHistoryResponse, RunStatusResponse
from app.services.run_traces import (
    build_live_run_comparison,
    get_latest_live_run_for_case,
    get_live_run_by_id,
    get_live_run_history_for_case,
    replay_live_run,
)

router = APIRouter()


@router.get("/runs/by-case/{case_id}", response_model=RunDetailResponse)
async def get_latest_run_for_case(case_id: str) -> RunDetailResponse:
    live_run = get_latest_live_run_for_case(case_id)
    if live_run is not None:
        return live_run

    fallback = next((run for run in RUN_DETAILS.values() if run.run.case_id == case_id), None)
    if fallback is not None:
        return fallback

    raise HTTPException(status_code=404, detail=f"No run trace found for case {case_id}")


@router.get("/runs/history/{case_id}", response_model=RunHistoryResponse)
async def get_run_history_for_case(case_id: str) -> RunHistoryResponse:
    history = get_live_run_history_for_case(case_id)
    if history is not None:
        return history

    fallback_runs = [run for run in RUN_DETAILS.values() if run.run.case_id == case_id]
    if fallback_runs:
        return RunHistoryResponse(
            case_id=case_id,
            runs=[
                {
                    "run_id": run.run.run_id,
                    "case_id": run.run.case_id,
                    "customer_name": run.run.customer_name,
                    "status": run.run.status,
                    "started_at": run.run.started_at,
                    "duration_ms": run.run.duration_ms,
                    "model_used": next(iter(run.model_routing), None).model if run.model_routing else None,
                }
                for run in fallback_runs
            ],
        )

    raise HTTPException(status_code=404, detail=f"No run history found for case {case_id}")


@router.get("/runs/{run_id}", response_model=RunDetailResponse)
async def get_run(run_id: str) -> RunDetailResponse:
    run = RUN_DETAILS.get(run_id)
    if run is not None:
        return run

    live_run = get_live_run_by_id(run_id)
    if live_run is not None:
        return live_run

    raise HTTPException(status_code=404, detail=f"Run {run_id} not found")


@router.get("/runs/{run_id}/status", response_model=RunStatusResponse)
async def get_run_status(run_id: str) -> RunStatusResponse:
    status = RUN_STATUSES.get(run_id)
    if status is None:
        raise HTTPException(status_code=404, detail=f"Run status for {run_id} not found")
    return status


@router.post("/runs/{run_id}/replay", response_model=CaseActionResponse)
async def replay_run(run_id: str) -> CaseActionResponse:
    run = RUN_DETAILS.get(run_id)
    if run is not None:
        return CaseActionResponse(
            case_id=run.run.case_id,
            status="running",
            message=f"Replay started for {run.run.customer_name}.",
        )

    live_replay = replay_live_run(run_id)
    if live_replay is not None:
        return live_replay

    raise HTTPException(status_code=404, detail=f"Run {run_id} not found")


@router.get("/runs/{run_id}/compare", response_model=RunCompareResponse)
async def compare_runs(run_id: str) -> RunCompareResponse:
    comparison = RUN_COMPARISONS.get(run_id)
    if comparison is not None:
        return comparison

    live_comparison = build_live_run_comparison(run_id)
    if live_comparison is not None:
        return live_comparison

    raise HTTPException(status_code=404, detail=f"Run comparison for {run_id} not found")
