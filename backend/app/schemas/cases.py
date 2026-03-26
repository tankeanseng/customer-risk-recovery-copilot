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
