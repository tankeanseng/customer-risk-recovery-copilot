import os
import json
import time
from datetime import datetime
from typing import Any

from langsmith import Client

from app.schemas.cases import CaseActionResponse
from app.schemas.runs import (
    ModelRoutingEntry,
    RunCompareResponse,
    RunDetailResponse,
    RunEvent,
    RunHistoryEntry,
    RunHistoryResponse,
    RunSummary,
    StructuredOutputEntry,
    ToolCallTrace,
    WorkflowNodeSummary,
)


class TraceLookupError(Exception):
    pass


def _langsmith_enabled() -> bool:
    return bool(os.getenv("LANGSMITH_API_KEY") and os.getenv("LANGSMITH_PROJECT"))


def _status_for_run(run: Any) -> str:
    if getattr(run, "error", None):
        return "failed"
    if getattr(run, "end_time", None):
        return "completed"
    return "running"


def _duration_ms(start_time: datetime | None, end_time: datetime | None) -> int:
    if start_time is None:
        return 0
    end_value = end_time or datetime.now(start_time.tzinfo)
    return max(int((end_value - start_time).total_seconds() * 1000), 0)


def _normalize_output_payload(value: Any) -> dict[str, str | int | float | bool | list[str]]:
    if not isinstance(value, dict):
        return {"summary": str(value)}

    normalized: dict[str, str | int | float | bool | list[str]] = {}
    for key, item in value.items():
        if isinstance(item, (str, int, float, bool)):
            normalized[key] = item
        elif isinstance(item, list) and all(isinstance(entry, str) for entry in item):
            normalized[key] = item
        else:
            normalized[key] = str(item)
    return normalized


def _extract_recommendation(root_run: Any, child_runs: list[Any]) -> dict[str, Any]:
    outputs = getattr(root_run, "outputs", {}) or {}
    output_value = outputs.get("output")
    if isinstance(output_value, list) and output_value:
        first = output_value[0]
        if isinstance(first, dict):
            return first
    if isinstance(output_value, dict):
        return output_value

    for child in reversed(child_runs):
        child_outputs = getattr(child, "outputs", {}) or {}
        child_content = child_outputs.get("content")
        if isinstance(child_content, str) and child_content:
            try:
                parsed = json.loads(child_content)
                if isinstance(parsed, dict):
                    return parsed
            except json.JSONDecodeError:
                continue
    return {}


def _workflow_root_name(run: Any) -> str:
    metadata = getattr(run, "metadata", {}) or {}
    workflow_name = str(metadata.get("workflow_name") or getattr(run, "name", "") or "")
    if workflow_name == "live_case_review":
        return "live_case_review"
    if workflow_name == "approval_resume_workflow":
        return "approval_resume_workflow"
    return str(getattr(run, "name", "") or workflow_name)


def _get_project_runs(limit: int = 100) -> list[Any]:
    if not _langsmith_enabled():
        return []
    client = Client()
    return list(client.list_runs(project_name=os.getenv("LANGSMITH_PROJECT"), limit=limit))


def _find_root_run(runs: list[Any], *, run_id: str | None = None, case_id: str | None = None) -> Any | None:
    for run in runs:
        if getattr(run, "parent_run_id", None):
            continue
        if _workflow_root_name(run) not in {"live_case_review", "approval_resume_workflow"}:
            continue
        metadata = getattr(run, "metadata", {}) or {}
        if run_id and str(getattr(run, "id", "")) == run_id:
            return run
        if case_id and metadata.get("case_id") == case_id:
            return run
    return None


def _root_runs_for_case(runs: list[Any], case_id: str) -> list[Any]:
    matched = []
    for run in runs:
        if getattr(run, "parent_run_id", None):
            continue
        if _workflow_root_name(run) not in {"live_case_review", "approval_resume_workflow"}:
            continue
        metadata = getattr(run, "metadata", {}) or {}
        if metadata.get("case_id") == case_id:
            matched.append(run)
    matched.sort(key=lambda run: getattr(getattr(run, "start_time", None), "timestamp", lambda: 0.0)(), reverse=True)
    return matched


def _find_descendant_runs(runs: list[Any], root_run_id: str) -> list[Any]:
    descendants: list[Any] = []
    pending_parents = {root_run_id}
    seen_ids: set[str] = set()

    while pending_parents:
        next_pending: set[str] = set()
        for run in runs:
            parent_run_id = str(getattr(run, "parent_run_id", "") or "")
            run_id = str(getattr(run, "id", ""))
            if parent_run_id in pending_parents and run_id not in seen_ids:
                descendants.append(run)
                seen_ids.add(run_id)
                next_pending.add(run_id)
        pending_parents = next_pending

    descendants.sort(key=lambda run: getattr(getattr(run, "start_time", None), "timestamp", lambda: 0.0)())
    return descendants


def _build_run_detail_from_langsmith(root_run: Any, child_runs: list[Any]) -> RunDetailResponse:
    metadata = getattr(root_run, "metadata", {}) or {}
    workflow_name = _workflow_root_name(root_run)
    recommendation = _extract_recommendation(root_run, child_runs)
    start_time = getattr(root_run, "start_time", None)
    end_time = getattr(root_run, "end_time", None)
    provider_model = metadata.get("provider_model")
    model_call_runs = [run for run in child_runs if getattr(run, "name", None) == "case_review_model_call"]
    mcp_tool_runs = [run for run in child_runs if getattr(run, "name", None) == "mcp_tool_call"]
    graph_step_runs = [
        run
        for run in child_runs
        if getattr(run, "name", None)
        in {
            "case_review_intake_node",
            "case_review_review_node",
            "case_review_policy_node",
            "approval_resume_decision_node",
            "approval_resume_dispatch_node",
        }
    ]

    if provider_model is None and model_call_runs:
        provider_model = (getattr(model_call_runs[-1], "metadata", {}) or {}).get("provider_model")

    summary = RunSummary(
        run_id=str(root_run.id),
        case_id=metadata.get("case_id", "unknown_case"),
        customer_id=f"customer_for_{metadata.get('case_id', 'unknown_case')}",
        customer_name=metadata.get("customer_name", "Unknown customer"),
        status=_status_for_run(root_run),
        workflow_name=workflow_name,
        source_surface=metadata.get("review_surface"),
        approval_id=metadata.get("approval_id"),
        started_at=start_time.isoformat() if start_time else "",
        ended_at=end_time.isoformat() if end_time else "",
        duration_ms=_duration_ms(start_time, end_time),
        estimated_cost_usd=float(getattr(root_run, "total_cost", 0.0) or 0.0),
        approval_interrupt_occurred=bool(
            metadata.get("hard_trigger_hit", False) or workflow_name == "approval_resume_workflow"
        ),
    )

    root_label = "Live Case Review" if workflow_name == "live_case_review" else "Approval Resume Workflow"
    root_summary = (
        recommendation.get("recommended_action", "Structured case review completed.")
        if workflow_name == "live_case_review"
        else recommendation.get("summary", "Approval resume workflow completed.")
    )
    workflow_nodes = [
        WorkflowNodeSummary(
            node_id=workflow_name,
            label=root_label,
            status=_status_for_run(root_run),
            duration_ms=_duration_ms(start_time, end_time),
            model=provider_model,
            summary=root_summary,
        )
    ]
    node_labels = {
        "case_review_intake_node": "Intake Node",
        "case_review_review_node": "Review Node",
        "case_review_policy_node": "Policy Node",
        "approval_resume_decision_node": "Approval Decision Node",
        "approval_resume_dispatch_node": "Execution Dispatch Node",
    }

    model_routing: list[ModelRoutingEntry] = []
    events = [
        RunEvent(
            event_type="run_started",
            timestamp=summary.started_at,
            summary=(
                f"Live case review started for {summary.customer_name}."
                if workflow_name == "live_case_review"
                else f"Approval resume workflow started for {summary.customer_name}."
            ),
        )
    ]

    for index, child in enumerate(graph_step_runs, start=1):
        child_start = getattr(child, "start_time", None)
        child_end = getattr(child, "end_time", None)
        child_name = str(getattr(child, "name", None) or "graph_step")
        child_outputs = getattr(child, "outputs", {}) or {}
        output_value = child_outputs.get("output", child_outputs)

        workflow_nodes.append(
            WorkflowNodeSummary(
                node_id=f"workflow_step_{index}",
                label=node_labels.get(child_name, child_name),
                status=_status_for_run(child),
                duration_ms=_duration_ms(child_start, child_end),
                model=provider_model if child_name == "case_review_review_node" else None,
                summary=str(_normalize_output_payload(output_value).get("summary", "Workflow step completed.")),
            )
        )
        events.append(
            RunEvent(
                event_type="workflow_step_completed",
                timestamp=child_end.isoformat() if child_end else (child_start.isoformat() if child_start else ""),
                node_id=f"workflow_step_{index}",
                summary=f"{node_labels.get(child_name, child_name)} completed.",
            )
        )

    for index, child in enumerate(model_call_runs, start=1):
        child_metadata = getattr(child, "metadata", {}) or {}
        child_outputs = getattr(child, "outputs", {}) or {}
        child_provider_model = child_metadata.get("provider_model", provider_model or "unknown")
        child_start = getattr(child, "start_time", None)
        child_end = getattr(child, "end_time", None)

        workflow_nodes.append(
            WorkflowNodeSummary(
                node_id=f"model_call_{index}",
                label="Model Call",
                status=_status_for_run(child),
                duration_ms=_duration_ms(child_start, child_end),
                model=child_provider_model,
                summary="Model returned structured JSON response.",
            )
        )
        model_routing.append(
            ModelRoutingEntry(
                node_id=f"model_call_{index}",
                model=child_provider_model,
                provider="openai" if str(child_provider_model).startswith("openai/") else "unknown",
                route_reason="Live case-review model invocation",
                fallback_used=bool(child_metadata.get("attempt", 1) > 1),
            )
        )
        events.append(
            RunEvent(
                event_type="model_call_completed",
                timestamp=child_end.isoformat() if child_end else (child_start.isoformat() if child_start else ""),
                node_id=f"model_call_{index}",
                summary=f"Structured output returned from {child_provider_model}.",
            )
        )

        child_content = child_outputs.get("content")
        if isinstance(child_content, str) and child_content:
            events.append(
                RunEvent(
                    event_type="model_output_captured",
                    timestamp=child_end.isoformat() if child_end else (child_start.isoformat() if child_start else ""),
                    node_id=f"model_call_{index}",
                    summary="Raw model response captured for validation and tracing.",
                )
            )

    if end_time:
        events.append(
            RunEvent(
                event_type="run_completed",
                timestamp=end_time.isoformat(),
                summary=(
                    f"Live case review completed with status {summary.status}."
                    if workflow_name == "live_case_review"
                    else f"Approval resume workflow completed with status {summary.status}."
                ),
            )
        )

    structured_outputs = [
        StructuredOutputEntry(
            node_id=workflow_name,
            title="Validated Recommendation" if workflow_name == "live_case_review" else "Approval Resume Output",
            payload=_normalize_output_payload(recommendation),
        )
    ]

    tool_calls: list[ToolCallTrace] = []
    for index, tool_run in enumerate(mcp_tool_runs, start=1):
        tool_outputs = getattr(tool_run, "outputs", {}) or {}
        tool_metadata = getattr(tool_run, "metadata", {}) or {}
        tool_start = getattr(tool_run, "start_time", None)
        tool_end = getattr(tool_run, "end_time", None)
        tool_calls.append(
            ToolCallTrace(
                tool_call_id=f"mcp_tool_{index}",
                node_id="live_case_review",
                mcp_server=str(tool_outputs.get("server_name") or tool_metadata.get("server_name") or "unknown_mcp"),
                tool_name=str(tool_outputs.get("tool_name") or tool_metadata.get("tool_name") or "unknown_tool"),
                status="failed" if getattr(tool_run, "error", None) else "completed",
                latency_ms=_duration_ms(tool_start, tool_end),
                input_summary=str(tool_outputs.get("arguments_summary", "Arguments unavailable")),
                output_summary=str(tool_outputs.get("output_summary", "Tool output unavailable")),
            )
        )

    if not tool_calls:
        tool_calls.append(
            ToolCallTrace(
                tool_call_id="toolcall_none",
                node_id=workflow_name,
                mcp_server="not_yet_connected",
                tool_name="No MCP tools invoked",
                status="completed",
                latency_ms=0,
                input_summary=(
                    "Current live review uses direct model input from case payload."
                    if workflow_name == "live_case_review"
                    else "Approval resume workflow currently uses manager decision context without MCP."
                ),
                output_summary=(
                    "MCP-backed data access will appear here after MCP integration."
                    if workflow_name == "live_case_review"
                    else "No MCP tool call was needed for this approval resume flow."
                ),
            )
        )

    return RunDetailResponse(
        run=summary,
        workflow_nodes=workflow_nodes,
        tool_calls=tool_calls,
        structured_outputs=structured_outputs,
        model_routing=model_routing,
        events=events,
    )


def get_latest_live_run_for_case(case_id: str) -> RunDetailResponse | None:
    runs = _get_project_runs()
    root_run = _find_root_run(runs, case_id=case_id)
    if root_run is None:
        return None
    child_runs = _find_descendant_runs(runs, str(root_run.id))
    return _build_run_detail_from_langsmith(root_run, child_runs)


def get_live_run_by_id(run_id: str) -> RunDetailResponse | None:
    runs = _get_project_runs()
    root_run = _find_root_run(runs, run_id=run_id)
    if root_run is None:
        return None
    child_runs = _find_descendant_runs(runs, str(root_run.id))
    return _build_run_detail_from_langsmith(root_run, child_runs)


def wait_for_live_run_by_id(run_id: str, attempts: int = 4, delay_seconds: float = 0.35) -> RunDetailResponse | None:
    for attempt in range(attempts):
        detail = get_live_run_by_id(run_id)
        if detail is not None:
            return detail
        if attempt < attempts - 1:
            time.sleep(delay_seconds)
    return None


def build_live_run_comparison(run_id: str) -> RunCompareResponse | None:
    runs = _get_project_runs()
    root_run = _find_root_run(runs, run_id=run_id)
    if root_run is None:
        return None
    child_runs = _find_descendant_runs(runs, str(root_run.id))
    detail = _build_run_detail_from_langsmith(root_run, child_runs)
    metadata = getattr(root_run, "metadata", {}) or {}
    workflow_name = _workflow_root_name(root_run)

    structured = detail.structured_outputs[0].payload if detail.structured_outputs else {}
    if workflow_name == "approval_resume_workflow":
        differences = [
            f"Approval ID: {structured.get('approval_id', metadata.get('approval_id', 'Unknown'))}",
            f"Requested action: {structured.get('requested_action', metadata.get('requested_action', 'Unavailable'))}",
            f"Final case status: {structured.get('case_status', 'Unavailable')}",
            f"Manager comment: {structured.get('manager_comment', 'Unavailable')}",
            f"Next step: {structured.get('next_step', 'Unavailable')}",
        ]
        baseline_run_id = metadata.get("approval_id", f"approval_{detail.run.case_id}")
    else:
        differences = [
            f"Baseline risk band: {metadata.get('baseline_risk_band', 'Unknown')}",
            f"Baseline triage score: {metadata.get('triage_score', 'Unknown')}",
            f"Live recommendation: {structured.get('recommended_action', 'Unavailable')}",
            f"Live risk band: {structured.get('risk_band', 'Unavailable')}",
            f"Live risk score: {structured.get('risk_score', 'Unavailable')}",
        ]
        baseline_run_id = f"baseline_{detail.run.case_id}"
    return RunCompareResponse(
        baseline_run_id=baseline_run_id,
        candidate_run_id=detail.run.run_id,
        differences=differences,
    )


def replay_live_run(run_id: str) -> CaseActionResponse | None:
    detail = get_live_run_by_id(run_id)
    if detail is None:
        return None
    return CaseActionResponse(
        case_id=detail.run.case_id,
        status="running",
        message=f"Replay started for {detail.run.customer_name}.",
    )


def get_live_run_history_for_case(case_id: str, limit: int = 5) -> RunHistoryResponse | None:
    runs = _get_project_runs()
    roots = _root_runs_for_case(runs, case_id)[:limit]
    if not roots:
        return None

    history: list[RunHistoryEntry] = []
    for root_run in roots:
        metadata = getattr(root_run, "metadata", {}) or {}
        start_time = getattr(root_run, "start_time", None)
        end_time = getattr(root_run, "end_time", None)
        history.append(
            RunHistoryEntry(
                run_id=str(root_run.id),
                case_id=metadata.get("case_id", case_id),
                customer_name=metadata.get("customer_name", "Unknown customer"),
                status=_status_for_run(root_run),
                started_at=start_time.isoformat() if start_time else "",
                duration_ms=_duration_ms(start_time, end_time),
                model_used=metadata.get("provider_model"),
            )
        )

    return RunHistoryResponse(case_id=case_id, runs=history)


def get_latest_live_run_ids_by_case(case_ids: list[str]) -> dict[str, str]:
    runs = _get_project_runs()
    result: dict[str, str] = {}
    for case_id in case_ids:
        roots = _root_runs_for_case(runs, case_id)
        if roots:
            result[case_id] = str(roots[0].id)
    return result
