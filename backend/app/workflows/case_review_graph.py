from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph
from langsmith import traceable
from langsmith.run_helpers import get_current_run_tree

from app.schemas.cases import LiveCaseReviewOutput
from app.services.case_review import build_case_review_trace_metadata, execute_live_case_review_logic


class CaseReviewGraphState(TypedDict, total=False):
    case_payload: dict[str, Any]
    model_override: str | None
    intake_summary: dict[str, Any]
    review_output: dict[str, Any]
    provider_model: str
    policy_gate: dict[str, Any]


@traceable(name="case_review_intake_node", run_type="chain")
def _run_intake_step(case_payload: dict[str, Any]) -> dict[str, Any]:
    triage = case_payload.get("triage", {})
    trigger_reasons = triage.get("trigger_reasons", [])
    reason_labels = [entry.get("label", "Unknown trigger") for entry in trigger_reasons if isinstance(entry, dict)]

    return {
        "triage_score": triage.get("triage_score"),
        "triage_risk_band": triage.get("risk_band"),
        "hard_trigger_hit": triage.get("hard_trigger_hit", False),
        "trigger_reason_count": len(reason_labels),
        "trigger_reason_labels": reason_labels[:3],
        "summary": (
            f"Prepared case {case_payload.get('case_id')} for live review "
            f"with triage band {triage.get('risk_band', 'Unknown')}."
        ),
    }


@traceable(name="case_review_review_node", run_type="chain")
def _run_review_step(case_payload: dict[str, Any], model_override: str | None = None) -> dict[str, Any]:
    review, provider_model = execute_live_case_review_logic(case_payload, model_override=model_override)
    return {
        "review_output": review.model_dump(),
        "provider_model": provider_model,
        "summary": f"Model review completed with {provider_model}.",
    }


@traceable(name="case_review_policy_node", run_type="chain")
def _run_policy_step(case_payload: dict[str, Any], review_output: dict[str, Any]) -> dict[str, Any]:
    triage = case_payload.get("triage", {})
    risk_band = str(review_output.get("risk_band", case_payload.get("baseline_risk_band", "Watchlist")))
    risk_score = int(review_output.get("risk_score", case_payload.get("baseline_risk_score", 0)))
    policy_status = str(review_output.get("policy_status", ""))
    approval_required = (
        risk_band == "Critical"
        or risk_score >= 85
        or bool(triage.get("hard_trigger_hit"))
        or "approval" in policy_status.lower()
    )

    return {
        "approval_required": approval_required,
        "approval_reason": (
            "Escalation threshold reached for approval workflow."
            if approval_required
            else "No immediate approval needed after live review."
        ),
        "policy_summary": list(review_output.get("policy_summary", [])),
        "summary": (
            "Policy step routed case to approval."
            if approval_required
            else "Policy step cleared case without approval."
        ),
    }


def _intake_node(state: CaseReviewGraphState) -> CaseReviewGraphState:
    return {"intake_summary": _run_intake_step(state["case_payload"])}


def _review_node(state: CaseReviewGraphState) -> CaseReviewGraphState:
    result = _run_review_step(state["case_payload"], model_override=state.get("model_override"))
    return {
        "review_output": result["review_output"],
        "provider_model": result["provider_model"],
    }


def _policy_node(state: CaseReviewGraphState) -> CaseReviewGraphState:
    return {"policy_gate": _run_policy_step(state["case_payload"], state["review_output"])}


def _build_graph():
    graph = StateGraph(CaseReviewGraphState)
    graph.add_node("intake", _intake_node)
    graph.add_node("review", _review_node)
    graph.add_node("policy", _policy_node)
    graph.add_edge(START, "intake")
    graph.add_edge("intake", "review")
    graph.add_edge("review", "policy")
    graph.add_edge("policy", END)
    return graph.compile()


CASE_REVIEW_GRAPH = _build_graph()


@traceable(name="live_case_review", run_type="chain")
def run_case_review_graph(
    case_payload: dict[str, Any],
    model_override: str | None = None,
) -> tuple[LiveCaseReviewOutput, str, str | None]:
    result = CASE_REVIEW_GRAPH.invoke(
        {
            "case_payload": case_payload,
            "model_override": model_override,
        }
    )
    current_run = get_current_run_tree()
    provider_model = str(result.get("provider_model", "unknown"))
    review_output = LiveCaseReviewOutput.model_validate(result["review_output"])
    return review_output, provider_model, (str(current_run.id) if current_run is not None else None)


def build_graph_trace_metadata(case_payload: dict[str, Any]) -> dict[str, Any]:
    return {
        **build_case_review_trace_metadata(case_payload),
        "workflow_engine": "langgraph",
        "workflow_version": "case_review_graph_v1",
    }
