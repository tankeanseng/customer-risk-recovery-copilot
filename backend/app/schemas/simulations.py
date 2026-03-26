from typing import Literal

from pydantic import BaseModel

from app.schemas.common import RiskBand


class ScenarioInputs(BaseModel):
    days_overdue_delta: int
    outstanding_balance_delta: float
    partial_payment_amount: float
    broken_promises_count_delta: int
    order_trend_state: Literal["recovering", "stable", "declining", "sharply_declining"]
    dispute_status: Literal["none", "open", "closed"]
    strategic_flag: bool
    credit_limit: float
    payment_terms_days: int
    account_manager_confidence: int


class SimulationSummary(BaseModel):
    risk_level: RiskBand
    risk_score: int
    recommended_action: str
    approval_required: bool
    top_drivers: list[str]


class PolicyImpact(BaseModel):
    newly_triggered_rules: list[str]
    approval_state_changed: bool


class SimulationDeltaReport(BaseModel):
    changed_inputs: list[str]
    risk_level_before: RiskBand
    risk_level_after: RiskBand
    action_before: str
    action_after: str
    top_changed_drivers: list[str]
    policy_impact: PolicyImpact


class AgentChangeSummary(BaseModel):
    agent: str
    change: str


class SimulationExplanation(BaseModel):
    summary: str
    agent_changes: list[AgentChangeSummary]


class TraceReference(BaseModel):
    simulation_run_id: str
    trace_available: bool


class SimulationRunMeta(BaseModel):
    simulation_id: str
    case_id: str
    scenario_name: str
    status: Literal["draft", "running", "completed", "failed", "saved"]
    started_at: str
    ended_at: str
    duration_ms: int


class SimulationResponse(BaseModel):
    simulation: SimulationRunMeta
    inputs: ScenarioInputs
    baseline: SimulationSummary
    scenario_result: SimulationSummary
    delta_report: SimulationDeltaReport
    explanation: SimulationExplanation
    trace_reference: TraceReference


class SavedSimulationSummary(BaseModel):
    simulation_id: str
    scenario_name: str
    created_at: str
    risk_level_after: RiskBand
    approval_required: bool


class SimulationListResponse(BaseModel):
    case_id: str
    saved_scenarios: list[SavedSimulationSummary]
