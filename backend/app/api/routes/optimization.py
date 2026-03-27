from fastapi import APIRouter, HTTPException

from app.schemas.optimization import OptimizationRunDetailResponse, OptimizationRunsResponse, OptimizationSummaryResponse
from app.services.optimization_results import get_optimization_run, get_optimization_summary, list_optimization_runs

router = APIRouter()


@router.get("/optimization/summary", response_model=OptimizationSummaryResponse)
async def optimization_summary() -> OptimizationSummaryResponse:
    return get_optimization_summary()


@router.get("/optimization/runs", response_model=OptimizationRunsResponse)
async def optimization_runs() -> OptimizationRunsResponse:
    return list_optimization_runs()


@router.get("/optimization/runs/{optimization_run_id}", response_model=OptimizationRunDetailResponse)
async def optimization_run(optimization_run_id: str) -> OptimizationRunDetailResponse:
    try:
        return get_optimization_run(optimization_run_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Optimization run {optimization_run_id} not found") from exc
