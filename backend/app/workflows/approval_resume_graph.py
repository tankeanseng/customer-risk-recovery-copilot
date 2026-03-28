from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph
from langsmith import traceable
from langsmith.run_helpers import get_current_run_tree


class ApprovalResumeGraphState(TypedDict, total=False):
    approval_context: dict[str, Any]
    manager_comment: str
    decision_summary: dict[str, Any]
    dispatch_summary: dict[str, Any]


@traceable(name="approval_resume_decision_node", run_type="chain")
def _run_decision_step(approval_context: dict[str, Any], manager_comment: str) -> dict[str, Any]:
    return {
        "approval_id": approval_context["approval_id"],
        "case_id": approval_context["case_id"],
        "customer_name": approval_context["customer_name"],
        "requested_action": approval_context["requested_action"],
        "manager_comment": manager_comment or "No manager comment provided.",
        "summary": f"Manager approved {approval_context['requested_action']} for {approval_context['customer_name']}.",
    }


@traceable(name="approval_resume_dispatch_node", run_type="chain")
def _run_dispatch_step(decision_summary: dict[str, Any]) -> dict[str, Any]:
    return {
        "dispatch_status": "completed",
        "case_status": "approved",
        "next_step": "Execution dispatch completed for downstream collections handling.",
        "summary": (
            f"Execution dispatch completed for approval {decision_summary['approval_id']} "
            f"on case {decision_summary['case_id']}."
        ),
    }


def _decision_node(state: ApprovalResumeGraphState) -> ApprovalResumeGraphState:
    return {
        "decision_summary": _run_decision_step(
            state["approval_context"],
            state.get("manager_comment", ""),
        )
    }


def _dispatch_node(state: ApprovalResumeGraphState) -> ApprovalResumeGraphState:
    return {"dispatch_summary": _run_dispatch_step(state["decision_summary"])}


def _build_graph():
    graph = StateGraph(ApprovalResumeGraphState)
    graph.add_node("decision", _decision_node)
    graph.add_node("dispatch", _dispatch_node)
    graph.add_edge(START, "decision")
    graph.add_edge("decision", "dispatch")
    graph.add_edge("dispatch", END)
    return graph.compile()


APPROVAL_RESUME_GRAPH = _build_graph()


def build_approval_resume_trace_metadata(approval_context: dict[str, Any]) -> dict[str, Any]:
    return {
        "workflow_name": "approval_resume_workflow",
        "workflow_engine": "langgraph",
        "workflow_version": "approval_resume_graph_v1",
        "review_surface": "approval_queue",
        "approval_id": approval_context.get("approval_id"),
        "case_id": approval_context.get("case_id"),
        "customer_name": approval_context.get("customer_name"),
        "requested_action": approval_context.get("requested_action"),
        "approval_priority": approval_context.get("priority"),
        "approval_risk_level": approval_context.get("risk_level"),
    }


def build_approval_resume_trace_tags(approval_context: dict[str, Any]) -> list[str]:
    risk_level = str(approval_context.get("risk_level", "unknown")).lower()
    return [
        "workflow:approval-resume",
        "decision:approved",
        f"risk-band:{risk_level}",
    ]


@traceable(name="approval_resume_workflow", run_type="chain")
def run_approval_resume_graph(
    approval_context: dict[str, Any],
    manager_comment: str,
) -> tuple[dict[str, Any], str | None]:
    result = APPROVAL_RESUME_GRAPH.invoke(
        {
            "approval_context": approval_context,
            "manager_comment": manager_comment,
        }
    )
    current_run = get_current_run_tree()
    final_output = {
        **result["decision_summary"],
        **result["dispatch_summary"],
    }
    return final_output, (str(current_run.id) if current_run is not None else None)
