from pydantic import BaseModel

from app.schemas.common import ApprovalStatus, ReviewMode, RiskBand, RunStatus, TriggerReasonChip


class PortfolioRow(BaseModel):
    customer_id: str
    case_id: str
    customer_name: str
    segment: str
    region: str
    triage_score: int
    risk_band: RiskBand
    outstanding_balance: float
    overdue_balance: float
    oldest_overdue_days: int
    trigger_reasons: list[TriggerReasonChip]
    latest_recommendation: str
    approval_required: bool
    approval_status: ApprovalStatus
    latest_run_status: RunStatus | None = None
    latest_review_mode: ReviewMode


class PortfolioKpis(BaseModel):
    total_outstanding_balance: float
    total_overdue_balance: float
    high_risk_count: int
    approvals_needed_count: int
    triage_flagged_count: int
    ai_review_recommended_count: int


class PortfolioFilters(BaseModel):
    regions: list[str]
    segments: list[str]
    risk_bands: list[str]
    approval_statuses: list[str]


class PortfolioResponse(BaseModel):
    kpis: PortfolioKpis
    filters: PortfolioFilters
    rows: list[PortfolioRow]
