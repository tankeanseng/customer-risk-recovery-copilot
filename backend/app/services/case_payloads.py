from fastapi import HTTPException

from app.data.mock_store import CASE_DETAILS, CASES_LIST
from app.schemas.cases import CaseDetailResponse


def build_case_detail(case_id: str) -> CaseDetailResponse:
    case = CASE_DETAILS.get(case_id)
    if case is not None:
        return CaseDetailResponse(case_id=case_id, **case)

    matching_case = next((row for row in CASES_LIST.rows if row.case_id == case_id), None)
    if matching_case is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    risk_band = (
        "Critical"
        if matching_case.status == "awaiting_approval"
        else "High"
        if matching_case.priority == "high"
        else "Monitor"
    )

    return CaseDetailResponse(
        case_id=case_id,
        customer_name=matching_case.customer_name,
        segment=matching_case.segment,
        region=matching_case.region,
        relationship_duration="Demo profile",
        payment_terms="Terms vary by account",
        credit_limit=0,
        account_owner="Assigned account lead",
        strategic="Unknown",
        tier="Demo",
        risk_band=risk_band,
        risk_score=50,
        triage={
            "triage_score": 50,
            "risk_band": risk_band,
            "hard_trigger_hit": matching_case.status == "awaiting_approval",
            "trigger_reasons": [{"label": matching_case.trigger_reason}],
            "latest_baseline_review_at": matching_case.updated_at,
            "case_source": "Generated from case queue metadata",
        },
        case_brief={
            "customer_summary": f"{matching_case.customer_name} loaded from case queue fallback detail.",
            "risk_summary": matching_case.trigger_reason,
            "recommended_action": matching_case.latest_recommendation,
            "why_now": "Fallback detail is being used while the full narrative dataset is expanded.",
            "policy_status": f"Approval status: {matching_case.approval_status}",
            "next_steps": ["Open trace if available", "Run live AI review", "Inspect queue state"],
        },
        risk_drivers=[matching_case.trigger_reason, matching_case.latest_recommendation],
        notes=[
            "Full narrative detail for this account is still being expanded in the demo dataset.",
            "Queue, workflow, and action handling remain available.",
        ],
        policy_summary=["Fallback detail view", "Use queue and approvals state for current demo behavior"],
    )


def build_case_payload(detail: CaseDetailResponse) -> dict:
    return {
        "case_id": detail.case_id,
        "customer_name": detail.customer_name,
        "segment": detail.segment,
        "region": detail.region,
        "relationship_duration": detail.relationship_duration,
        "payment_terms": detail.payment_terms,
        "credit_limit": detail.credit_limit,
        "account_owner": detail.account_owner,
        "strategic": detail.strategic,
        "tier": detail.tier,
        "baseline_risk_band": detail.risk_band,
        "baseline_risk_score": detail.risk_score,
        "triage": detail.triage.model_dump(),
        "case_brief": detail.case_brief.model_dump(),
        "risk_drivers": detail.risk_drivers,
        "notes": detail.notes,
        "policy_summary": detail.policy_summary,
    }
