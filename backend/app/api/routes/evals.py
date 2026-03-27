from fastapi import APIRouter, HTTPException

from app.schemas.evals import EvalRunActionResponse, EvalRunDetailResponse, EvalScenariosResponse, EvalSummaryResponse
from app.services.eval_results import EvalResultsNotFoundError, get_eval_run_detail, get_eval_scenarios, get_eval_summary, refresh_eval_snapshot

router = APIRouter()


@router.get("/evals/summary", response_model=EvalSummaryResponse)
async def fetch_eval_summary() -> EvalSummaryResponse:
    try:
        return get_eval_summary()
    except EvalResultsNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/evals/scenarios", response_model=EvalScenariosResponse)
async def fetch_eval_scenarios() -> EvalScenariosResponse:
    try:
        return get_eval_scenarios()
    except EvalResultsNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/evals/run", response_model=EvalRunActionResponse)
async def run_evals() -> EvalRunActionResponse:
    try:
        return refresh_eval_snapshot()
    except EvalResultsNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/evals/runs/{eval_run_id}", response_model=EvalRunDetailResponse)
async def get_eval_run(eval_run_id: str) -> EvalRunDetailResponse:
    try:
        return get_eval_run_detail(eval_run_id)
    except EvalResultsNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
