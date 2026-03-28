from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException

from app.schemas.approvals import (
    ApprovalDecisionRequest,
    ApprovalDecisionResponse,
    ApprovalDetail,
    ApprovalQueueResponse,
    ApprovalQueueSummary,
    ApprovalQueueRow,
    AuditEvent,
    EvidenceSnapshot,
    RecommendationSnapshot,
)
from app.schemas.cases import CaseActionResponse, CaseActivityEvent, CaseDetailResponse
from app.schemas.runs import (
    ModelRoutingEntry,
    RunCompareResponse,
    RunDetailResponse,
    RunEvent,
    RunStatusResponse,
    RunSummary,
    StructuredOutputEntry,
    WorkflowNodeSummary,
)
from app.services.case_payloads import build_case_detail
from app.services.run_traces import get_live_run_by_id, wait_for_live_run_by_id
from app.services.runtime_state import RuntimeStateSnapshot, load_runtime_state, save_runtime_state
from app.workflows.approval_resume_graph import (
    build_approval_resume_trace_metadata,
    build_approval_resume_trace_tags,
    run_approval_resume_graph,
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _find_queue_row(state: RuntimeStateSnapshot, approval_id: str) -> ApprovalQueueRow:
    row = next((item for item in state.approval_queue.queue if item.approval_id == approval_id), None)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Approval {approval_id} not found")
    return row


def _find_case_row(state: RuntimeStateSnapshot, case_id: str):
    row = next((item for item in state.cases_list.rows if item.case_id == case_id), None)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
    return row


def _find_approval_by_case(state: RuntimeStateSnapshot, case_id: str) -> ApprovalDetail | None:
    for detail in state.approval_details.values():
        if detail.case_id == case_id and detail.approval_status in {"pending", "revision_requested"}:
            return detail
    return None


def _recalculate_queue_summary(state: RuntimeStateSnapshot) -> ApprovalQueueSummary:
    pending = sum(1 for item in state.approval_queue.queue if item.status == "pending")
    approved = sum(1 for item in state.approval_queue.queue if item.status == "approved")
    rejected = sum(1 for item in state.approval_queue.queue if item.status == "rejected")
    revised = sum(1 for item in state.approval_queue.queue if item.status == "revision_requested")
    state.approval_queue.summary = ApprovalQueueSummary(
        pending_count=pending,
        approved_today=approved,
        rejected_today=rejected,
        revision_requested_today=revised,
    )
    return state.approval_queue.summary


def _select_default_detail(state: RuntimeStateSnapshot) -> ApprovalDetail:
    pending_first = next((item for item in state.approval_queue.queue if item.status == "pending"), None)
    target_id = pending_first.approval_id if pending_first is not None else state.approval_queue.queue[0].approval_id
    selected = state.approval_details[target_id]
    state.approval_queue.selected_detail = selected
    return selected


def _append_activity(state: RuntimeStateSnapshot, case_id: str, customer_name: str, event_type: str, summary: str) -> None:
    event_id = f"evt_{len(state.cases_list.activity_feed) + 1001}"
    state.cases_list.activity_feed.insert(
        0,
        CaseActivityEvent(
            event_id=event_id,
            event_type=event_type,
            case_id=case_id,
            customer_name=customer_name,
            timestamp=_now_iso(),
            summary=summary,
        ),
    )
    del state.cases_list.activity_feed[12:]


def _build_evidence_from_case(detail: CaseDetailResponse) -> EvidenceSnapshot:
    baseline_score = max(detail.risk_score, detail.triage.triage_score)
    outstanding_balance = float(detail.credit_limit)
    overdue_balance = round(outstanding_balance * min(0.82, max(0.18, baseline_score / 100)), 2)
    oldest_overdue_days = min(90, 18 + baseline_score)
    return EvidenceSnapshot(
        outstanding_balance=outstanding_balance,
        overdue_balance=overdue_balance,
        oldest_overdue_days=oldest_overdue_days,
        top_risk_drivers=detail.risk_drivers[:3] if detail.risk_drivers else [detail.case_brief.risk_summary],
    )


def _new_approval_id() -> str:
    state = load_runtime_state()
    existing_ids = [int(detail.approval_id.split("_")[1]) for detail in state.approval_details.values() if "_" in detail.approval_id]
    return f"app_{max(existing_ids, default=200) + 1}"


def _register_resumed_run_fallback(state: RuntimeStateSnapshot, approval_id: str, detail: ApprovalDetail, request: ApprovalDecisionRequest) -> str:
    run_id = f"run_resume_{approval_id}_{datetime.now(timezone.utc).strftime('%H%M%S')}"
    timestamp = _now_iso()
    summary = RunSummary(
        run_id=run_id,
        case_id=detail.case_id,
        customer_id=f"cust_{detail.case_id.split('_')[1]}",
        customer_name=detail.customer_name,
        status="resumed",
        started_at=timestamp,
        ended_at=timestamp,
        duration_ms=2800,
        estimated_cost_usd=0.0009,
        approval_interrupt_occurred=True,
    )
    state.run_details[run_id] = RunDetailResponse(
        run=summary,
        workflow_nodes=[
            WorkflowNodeSummary(
                node_id="approval_resume",
                label="Approval Resume Node",
                status="resumed",
                duration_ms=850,
                summary="Workflow resumed after manager approval.",
            ),
            WorkflowNodeSummary(
                node_id="execution_dispatch",
                label="Execution Dispatch Node",
                status="completed",
                duration_ms=1200,
                summary="Approved recommendation dispatched for downstream handling.",
            ),
        ],
        tool_calls=[],
        structured_outputs=[
            StructuredOutputEntry(
                node_id="approval_resume",
                title="Approval Decision",
                payload={
                    "approval_id": approval_id,
                    "decision": "approved",
                    "manager_comment": request.comment or "No manager comment provided.",
                    "requested_action": detail.requested_action,
                },
            )
        ],
        model_routing=[
            ModelRoutingEntry(
                node_id="approval_resume",
                model="human-approval",
                provider="manager",
                route_reason="Manager decision resumed the paused workflow.",
                fallback_used=False,
            )
        ],
        events=[
            RunEvent(
                event_type="workflow_resumed",
                timestamp=timestamp,
                node_id="approval_resume",
                summary="Workflow resumed from paused-for-approval state.",
            ),
            RunEvent(
                event_type="manager_approved",
                timestamp=timestamp,
                node_id="approval_resume",
                summary=request.comment or "Manager approved the requested action.",
            ),
        ],
    )
    state.run_statuses[run_id] = RunStatusResponse(
        run_id=run_id,
        status="resumed",
        current_node="Execution Dispatch Node",
        last_event="Workflow resumed after approval.",
    )
    state.run_comparisons[run_id] = RunCompareResponse(
        baseline_run_id=detail.latest_run_id or "baseline_review",
        candidate_run_id=run_id,
        differences=[
            "Approval gate cleared by manager decision.",
            "Workflow moved from paused-for-approval into execution dispatch.",
            "Manager comment recorded as part of the resumed run context.",
        ],
    )
    return run_id


def _approval_context(queue_row: ApprovalQueueRow, detail: ApprovalDetail) -> dict[str, str]:
    return {
        "approval_id": detail.approval_id,
        "case_id": detail.case_id,
        "customer_name": detail.customer_name,
        "requested_action": detail.requested_action,
        "priority": queue_row.priority,
        "risk_level": queue_row.risk_level,
    }


def _execute_resume_workflow(state: RuntimeStateSnapshot, approval_id: str, queue_row: ApprovalQueueRow, detail: ApprovalDetail, request: ApprovalDecisionRequest) -> tuple[str, bool]:
    approval_context = _approval_context(queue_row, detail)
    _, trace_run_id = run_approval_resume_graph(
        approval_context,
        request.comment,
        langsmith_extra={
            "metadata": build_approval_resume_trace_metadata(approval_context),
            "tags": build_approval_resume_trace_tags(approval_context),
        },
    )
    live_trace = wait_for_live_run_by_id(trace_run_id) if trace_run_id is not None else None
    if live_trace is not None:
        return live_trace.run.run_id, True

    fallback_run_id = _register_resumed_run_fallback(state, approval_id, detail, request)
    return fallback_run_id, False


def list_approvals() -> ApprovalQueueResponse:
    state = load_runtime_state()
    _recalculate_queue_summary(state)
    selected = _select_default_detail(state)
    save_runtime_state(state)
    return ApprovalQueueResponse(
        summary=state.approval_queue.summary,
        filters=state.approval_queue.filters,
        queue=state.approval_queue.queue,
        selected_detail=selected,
    )


def get_approval_detail(approval_id: str) -> ApprovalDetail:
    state = load_runtime_state()
    detail = state.approval_details.get(approval_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Approval {approval_id} not found")
    state.approval_queue.selected_detail = detail
    save_runtime_state(state)
    return detail


def create_case_approval_request(case_id: str) -> CaseActionResponse:
    state = load_runtime_state()
    existing = _find_approval_by_case(state, case_id)
    if existing is not None:
        return CaseActionResponse(
            case_id=case_id,
            status="awaiting_approval",
            message=f"Approval {existing.approval_id} is already active for this case.",
            approval_id=existing.approval_id,
            trace_run_id=existing.latest_run_id,
            trace_available=existing.latest_trace_available,
        )

    case_row = _find_case_row(state, case_id)
    detail = build_case_detail(case_id)
    existing_ids = [int(item.approval_id.split("_")[1]) for item in state.approval_details.values() if "_" in item.approval_id]
    approval_id = f"app_{max(existing_ids, default=200) + 1}"
    evidence = _build_evidence_from_case(detail)
    approval_detail = ApprovalDetail(
        approval_id=approval_id,
        case_id=case_id,
        customer_name=detail.customer_name,
        requested_action=detail.case_brief.recommended_action,
        approval_status="pending",
        case_status="awaiting_approval",
        risk_summary=detail.case_brief.risk_summary,
        policy_reason=detail.case_brief.policy_status,
        evidence_snapshot=evidence,
        latest_recommendation=RecommendationSnapshot(
            recommended_action=detail.case_brief.recommended_action,
            business_tradeoff=detail.case_brief.why_now,
        ),
        audit_history=[
            AuditEvent(
                event_type="approval_requested",
                timestamp=_now_iso(),
                actor="system",
                summary="Approval requested from the customer case page.",
            )
        ],
        latest_run_id=case_row.latest_run_id,
        latest_trace_available=bool(case_row.latest_run_id),
    )
    state.approval_details[approval_id] = approval_detail
    state.approval_queue.queue.insert(
        0,
        ApprovalQueueRow(
            approval_id=approval_id,
            case_id=case_id,
            customer_id=case_row.customer_id,
            customer_name=case_row.customer_name,
            requested_action=detail.case_brief.recommended_action,
            risk_level=detail.risk_band,
            priority=case_row.priority,
            policy_reason=detail.case_brief.policy_status,
            waiting_since=_now_iso(),
            status="pending",
        ),
    )
    case_row.status = "awaiting_approval"
    case_row.approval_required = True
    case_row.approval_status = "pending"
    case_row.latest_recommendation = detail.case_brief.recommended_action
    case_row.latest_run_status = "paused_for_approval"
    _append_activity(state, case_id, detail.customer_name, "approval_requested", "Case routed to manager approval from case page.")
    _recalculate_queue_summary(state)
    _select_default_detail(state)
    save_runtime_state(state)
    return CaseActionResponse(
        case_id=case_id,
        status="awaiting_approval",
        message=f"Case sent to approval queue as {approval_id}.",
        approval_id=approval_id,
        trace_run_id=case_row.latest_run_id,
        trace_available=bool(case_row.latest_run_id),
    )


def apply_approval_decision(approval_id: str, action: str, request: ApprovalDecisionRequest) -> ApprovalDecisionResponse:
    state = load_runtime_state()
    detail = state.approval_details.get(approval_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Approval {approval_id} not found")
    state.approval_queue.selected_detail = detail
    queue_row = _find_queue_row(state, approval_id)
    case_row = _find_case_row(state, detail.case_id)

    if action == "approve":
        queue_row.status = "approved"
        detail.approval_status = "approved"
        detail.case_status = "approved"
        resumed_run_id, live_trace_available = _execute_resume_workflow(state, approval_id, queue_row, detail, request)
        detail.latest_run_id = resumed_run_id
        detail.latest_trace_available = True
        case_row.status = "approved"
        case_row.approval_status = "approved"
        case_row.latest_run_id = resumed_run_id
        resumed_run = get_live_run_by_id(resumed_run_id) if live_trace_available else state.run_details.get(resumed_run_id)
        case_row.latest_run_status = resumed_run.run.status if resumed_run is not None else "resumed"
        detail.audit_history.insert(
            0,
            AuditEvent(
                event_type="approved",
                timestamp=_now_iso(),
                actor="manager",
                summary=request.comment or "Manager approved the requested action and resumed the workflow.",
            ),
        )
        _append_activity(state, detail.case_id, detail.customer_name, "approval_approved", "Approval completed and workflow resumed.")
        message = "Approval completed and workflow resumed."
        response = ApprovalDecisionResponse(
            approval_id=approval_id,
            status="approved",
            resumed_run_id=resumed_run_id,
            trace_run_id=resumed_run_id,
            trace_available=True,
            case_status="approved",
            message=message,
        )
    elif action == "reject":
        queue_row.status = "rejected"
        detail.approval_status = "rejected"
        detail.case_status = "rejected"
        case_row.status = "rejected"
        case_row.approval_status = "rejected"
        case_row.latest_run_status = "failed"
        detail.audit_history.insert(
            0,
            AuditEvent(
                event_type="rejected",
                timestamp=_now_iso(),
                actor="manager",
                summary=request.comment or "Manager rejected the recommendation.",
            ),
        )
        _append_activity(state, detail.case_id, detail.customer_name, "approval_rejected", "Approval rejected and case closed without execution.")
        response = ApprovalDecisionResponse(
            approval_id=approval_id,
            status="rejected",
            resumed_run_id=None,
            trace_run_id=detail.latest_run_id,
            trace_available=detail.latest_trace_available,
            case_status="rejected",
            message="Approval rejected. Case closed without executing the recommendation.",
        )
    elif action == "revise":
        queue_row.status = "revision_requested"
        detail.approval_status = "revision_requested"
        detail.case_status = "in_review"
        case_row.status = "in_review"
        case_row.approval_status = "revision_requested"
        case_row.latest_run_status = "paused_for_approval"
        detail.audit_history.insert(
            0,
            AuditEvent(
                event_type="revision_requested",
                timestamp=_now_iso(),
                actor="manager",
                summary=request.comment or "Manager requested a revised recommendation before approval.",
            ),
        )
        _append_activity(state, detail.case_id, detail.customer_name, "approval_revision_requested", "Manager requested revision before approval.")
        response = ApprovalDecisionResponse(
            approval_id=approval_id,
            status="revision_requested",
            resumed_run_id=None,
            trace_run_id=detail.latest_run_id,
            trace_available=detail.latest_trace_available,
            case_status="in_review",
            message="Revision requested. Case sent back for another analyst pass.",
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported approval action {action}")

    _recalculate_queue_summary(state)
    _select_default_detail(state)
    save_runtime_state(state)
    return response
