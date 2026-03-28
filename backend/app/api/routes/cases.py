from fastapi import APIRouter, HTTPException

from app.data.mock_store import CASE_RUN_RESPONSES
from app.schemas.cases import CaseActionResponse, CaseDetailResponse, CaseRunResponse, CasesListResponse
from app.services.approval_workflow import create_case_approval_request
from app.services.case_payloads import build_case_detail, build_case_payload
from app.services.case_review import (
    LiveReviewUnavailableError,
    build_case_review_trace_tags,
    is_live_review_enabled,
    policy_status_requires_approval,
)
from app.services.run_traces import get_latest_live_run_for_case, wait_for_live_run_by_id
from app.services.runtime_state import load_runtime_state, save_runtime_state
from app.workflows.case_review_graph import build_graph_trace_metadata, run_case_review_graph

router = APIRouter()


@router.get("/cases", response_model=CasesListResponse)
async def list_cases() -> CasesListResponse:
    return load_runtime_state().cases_list


@router.post("/cases")
async def create_case() -> dict[str, str]:
    return {"message": "TODO: implement create case endpoint"}


@router.get("/cases/{case_id}", response_model=CaseDetailResponse)
async def get_case(case_id: str) -> CaseDetailResponse:
    return build_case_detail(case_id)


@router.post("/cases/{case_id}/runs", response_model=CaseRunResponse)
def create_case_run(case_id: str) -> CaseRunResponse:
    detail = build_case_detail(case_id)
    case_payload = build_case_payload(detail)
    state = load_runtime_state()

    if is_live_review_enabled():
        try:
            review, model_used, trace_run_id = run_case_review_graph(
                case_payload,
                langsmith_extra={
                    "metadata": build_graph_trace_metadata(case_payload),
                    "tags": build_case_review_trace_tags(case_payload),
                },
            )
            exact_trace = wait_for_live_run_by_id(trace_run_id) if trace_run_id is not None else None
            latest_trace = exact_trace or get_latest_live_run_for_case(case_id)
            matching_case = next((row for row in state.cases_list.rows if row.case_id == case_id), None)
            if matching_case is not None:
                matching_case.latest_run_id = (
                    exact_trace.run.run_id
                    if exact_trace is not None
                    else (latest_trace.run.run_id if latest_trace is not None else matching_case.latest_run_id)
                )
                matching_case.latest_run_status = "completed"
                approval_needed = policy_status_requires_approval(review.policy_status)
                matching_case.status = "awaiting_approval" if approval_needed else "in_review"
                matching_case.approval_status = "pending" if approval_needed else "none"
                matching_case.latest_recommendation = review.recommended_action
                save_runtime_state(state)
            return CaseRunResponse(
                case_id=case_id,
                run_id=(exact_trace.run.run_id if exact_trace is not None else (latest_trace.run.run_id if latest_trace is not None else f"run_{case_id}_live")),
                status="completed",
                message=f"Live AI review completed for {detail.customer_name}.",
                review_mode="live",
                model_used=model_used,
                trace_available=latest_trace is not None,
                recommendation=review,
            )
        except (LiveReviewUnavailableError, Exception) as exc:
            run = CASE_RUN_RESPONSES.get(case_id)
            if run is not None:
                return CaseRunResponse(
                    case_id=run.case_id,
                    run_id=run.run_id,
                    status=run.status,
                    message=f"{run.message} Live model fallback used: {exc}",
                    review_mode="fallback",
                    trace_available=False,
                )

    run = CASE_RUN_RESPONSES.get(case_id)
    if run is not None:
        return run

    matching_case = next((row for row in state.cases_list.rows if row.case_id == case_id), None)
    if matching_case is None:
        raise HTTPException(status_code=404, detail=f"Case run template for {case_id} not found")

    return CaseRunResponse(
        case_id=case_id,
        run_id=f"run_{case_id}_demo",
        status="running",
        message=f"Live AI review started for {matching_case.customer_name}.",
        trace_available=False,
    )


@router.post("/cases/{case_id}/approval-requests", response_model=CaseActionResponse)
async def create_approval_request(case_id: str) -> CaseActionResponse:
    return create_case_approval_request(case_id)


@router.get("/cases/{case_id}/brief/export")
async def export_case_brief(case_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement brief export endpoint for {case_id}"}
