from typing import Literal

from pydantic import BaseModel

from app.schemas.common import ApprovalStatus, RiskBand


class ApprovalQueueSummary(BaseModel):
    pending_count: int
    approved_today: int
    rejected_today: int
    revision_requested_today: int


class ApprovalQueueFilters(BaseModel):
    priorities: list[Literal["low", "medium", "high"]]
    decision_states: list[ApprovalStatus]


class ApprovalQueueRow(BaseModel):
    approval_id: str
    case_id: str
    customer_id: str
    customer_name: str
    requested_action: str
    risk_level: RiskBand
    priority: Literal["low", "medium", "high"]
    policy_reason: str
    waiting_since: str
    status: ApprovalStatus


class EvidenceSnapshot(BaseModel):
    outstanding_balance: float
    overdue_balance: float
    oldest_overdue_days: int
    top_risk_drivers: list[str]


class RecommendationSnapshot(BaseModel):
    recommended_action: str
    business_tradeoff: str


class AuditEvent(BaseModel):
    event_type: str
    timestamp: str
    actor: str
    summary: str


class ApprovalDetail(BaseModel):
    approval_id: str
    case_id: str
    customer_name: str
    requested_action: str
    approval_status: ApprovalStatus = "pending"
    case_status: str = "awaiting_approval"
    risk_summary: str
    policy_reason: str
    evidence_snapshot: EvidenceSnapshot
    latest_recommendation: RecommendationSnapshot
    audit_history: list[AuditEvent]
    latest_run_id: str | None = None
    latest_trace_available: bool = False


class ApprovalQueueResponse(BaseModel):
    summary: ApprovalQueueSummary
    filters: ApprovalQueueFilters
    queue: list[ApprovalQueueRow]
    selected_detail: ApprovalDetail


class ApprovalDecisionRequest(BaseModel):
    comment: str = ""


class ApprovalDecisionResponse(BaseModel):
    approval_id: str
    status: ApprovalStatus
    resumed_run_id: str | None = None
    trace_run_id: str | None = None
    trace_available: bool = False
    case_status: str
    message: str
