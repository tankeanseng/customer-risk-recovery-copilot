from pydantic import BaseModel

from app.schemas.common import RiskBand, TriggerReasonChip


class TriageProvenance(BaseModel):
    triage_score: int
    risk_band: RiskBand
    hard_trigger_hit: bool
    trigger_reasons: list[TriggerReasonChip]
    latest_baseline_review_at: str
    case_source: str


class CaseDecisionBrief(BaseModel):
    customer_summary: str
    risk_summary: str
    recommended_action: str
    why_now: str
    policy_status: str
    next_steps: list[str]


class LiveCaseReviewOutput(BaseModel):
    risk_band: RiskBand
    risk_score: int
    customer_summary: str
    risk_summary: str
    recommended_action: str
    why_now: str
    policy_status: str
    next_steps: list[str]
    risk_drivers: list[str]
    policy_summary: list[str]


class CaseDetailResponse(BaseModel):
    case_id: str
    customer_name: str
    segment: str
    region: str
    relationship_duration: str
    payment_terms: str
    credit_limit: float
    account_owner: str
    strategic: str
    tier: str
    risk_band: RiskBand
    risk_score: int
    triage: TriageProvenance
    case_brief: CaseDecisionBrief
    risk_drivers: list[str]
    notes: list[str]
    policy_summary: list[str]


class CaseRunResponse(BaseModel):
    case_id: str
    run_id: str
    status: str
    message: str
    review_mode: str | None = None
    model_used: str | None = None
    recommendation: LiveCaseReviewOutput | None = None


class CaseActionResponse(BaseModel):
    case_id: str
    status: str
    message: str


class TriageRulesResponse(BaseModel):
    generated_at: str
    rule_groups: list[str]
    hard_triggers: list[str]


class CaseQueueSummary(BaseModel):
    total_cases: int
    new_cases: int
    in_review_cases: int
    awaiting_approval_cases: int
    approved_cases: int
    rejected_cases: int
    resolved_cases: int


class CaseQueueFilters(BaseModel):
    statuses: list[str]
    priorities: list[str]
    regions: list[str]
    segments: list[str]


class CaseQueueRow(BaseModel):
    case_id: str
    customer_id: str
    customer_name: str
    region: str
    segment: str
    status: str
    priority: str
    trigger_reason: str
    latest_recommendation: str
    approval_required: bool
    approval_status: str
    latest_run_id: str | None = None
    latest_run_status: str | None = None
    updated_at: str


class CaseActivityEvent(BaseModel):
    event_id: str
    event_type: str
    case_id: str
    customer_name: str
    timestamp: str
    summary: str


class CasesListResponse(BaseModel):
    summary: CaseQueueSummary
    filters: CaseQueueFilters
    rows: list[CaseQueueRow]
    activity_feed: list[CaseActivityEvent]
