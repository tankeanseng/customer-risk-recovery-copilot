from fastapi import APIRouter

from app.data.mock_store import CASE_APPROVAL_REQUEST_RESPONSES, CASE_RUN_RESPONSES, CASES_LIST
from app.schemas.cases import CaseActionResponse, CaseDetailResponse, CaseRunResponse, CasesListResponse
from app.services.case_payloads import build_case_detail, build_case_payload
from app.services.case_review import LiveReviewUnavailableError, is_live_review_enabled, run_live_case_review

router = APIRouter()


@router.get("/cases", response_model=CasesListResponse)
async def list_cases() -> CasesListResponse:
    return CASES_LIST


@router.post("/cases")
async def create_case() -> dict[str, str]:
    return {"message": "TODO: implement create case endpoint"}


@router.get("/cases/{case_id}", response_model=CaseDetailResponse)
async def get_case(case_id: str) -> CaseDetailResponse:
    return build_case_detail(case_id)


@router.post("/cases/{case_id}/runs", response_model=CaseRunResponse)
async def create_case_run(case_id: str) -> CaseRunResponse:
    detail = build_case_detail(case_id)

    if is_live_review_enabled():
        try:
            review, model_used = run_live_case_review(build_case_payload(detail))
            return CaseRunResponse(
                case_id=case_id,
                run_id=f"run_{case_id}_live",
                status="completed",
                message=f"Live AI review completed for {detail.customer_name}.",
                review_mode="live",
                model_used=model_used,
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
                )

    run = CASE_RUN_RESPONSES.get(case_id)
    if run is not None:
        return run

    matching_case = next((row for row in CASES_LIST.rows if row.case_id == case_id), None)
    if matching_case is None:
        raise HTTPException(status_code=404, detail=f"Case run template for {case_id} not found")

    return CaseRunResponse(
        case_id=case_id,
        run_id=f"run_{case_id}_demo",
        status="running",
        message=f"Live AI review started for {matching_case.customer_name}.",
    )


@router.post("/cases/{case_id}/approval-requests", response_model=CaseActionResponse)
async def create_approval_request(case_id: str) -> CaseActionResponse:
    action = CASE_APPROVAL_REQUEST_RESPONSES.get(case_id)
    if action is None:
        raise HTTPException(status_code=404, detail=f"Approval request template for {case_id} not found")
    return action


@router.get("/cases/{case_id}/brief/export")
async def export_case_brief(case_id: str) -> dict[str, str]:
    return {"message": f"TODO: implement brief export endpoint for {case_id}"}
