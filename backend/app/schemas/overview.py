from pydantic import BaseModel

from app.schemas.common import TriggerReasonChip


class OverviewHero(BaseModel):
    title: str
    subtitle: str


class OverviewKpis(BaseModel):
    total_outstanding_balance: float
    total_overdue_balance: float
    high_risk_customers: int
    approvals_pending: int
    active_review_runs: int
    average_review_time_seconds: int
    customers_newly_flagged: int
    customers_recommended_for_ai_review: int


class CriticalCaseSummary(BaseModel):
    customer_id: str
    case_id: str
    customer_name: str
    risk_band: str
    triage_score: int
    overdue_exposure: float
    reason: str
    latest_recommendation: str
    trigger_reasons: list[TriggerReasonChip]
    latest_run_id: str


class ActiveRunSummary(BaseModel):
    run_id: str
    case_id: str
    customer_name: str
    status: str
    current_node: str
    elapsed_seconds: int


class ApprovalQueuePreview(BaseModel):
    approval_id: str
    case_id: str
    customer_name: str
    requested_action: str
    priority: str
    waiting_minutes: int


class DemoWalkthrough(BaseModel):
    recommended_case_id: str
    recommended_customer_name: str
    steps: list[str]


class SystemSnapshot(BaseModel):
    mcp_servers: int
    specialist_agents: int
    latest_eval_pass_rate: float
    optimized_task: str
    triage_passed_at: str


class OverviewResponse(BaseModel):
    hero: OverviewHero
    kpis: OverviewKpis
    critical_cases: list[CriticalCaseSummary]
    active_runs: list[ActiveRunSummary]
    pending_approvals: list[ApprovalQueuePreview]
    demo_walkthrough: DemoWalkthrough
    ai_snapshot: SystemSnapshot

