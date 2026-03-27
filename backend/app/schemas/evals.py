from pydantic import BaseModel


class EvalSummaryMetrics(BaseModel):
    tool_selection_accuracy: float | None = None
    recommendation_pass_rate: float
    policy_compliance_rate: float
    schema_validity_rate: float
    approval_routing_correctness: float | None = None
    average_run_latency_ms: int | None = None


class EvalLatestRun(BaseModel):
    eval_run_id: str
    started_at: str
    completed_at: str
    scenario_count: int
    models_evaluated: list[str]
    repeat_count: int
    execution_mode: str


class EvalVersionComparison(BaseModel):
    baseline_version: str
    optimized_version: str
    baseline_score: float
    optimized_score: float
    comparison_note: str


class EvalSummaryResponse(BaseModel):
    summary: EvalSummaryMetrics
    latest_eval_run: EvalLatestRun
    version_comparison: EvalVersionComparison
    notes: list[str]


class EvalScenarioRow(BaseModel):
    scenario_id: str
    case_id: str
    label: str
    customer_name: str
    expected_action_band: str
    actual_action: str
    tool_selection_correct: bool | None = None
    policy_compliant: bool
    approval_routing_correct: bool | None = None
    status: str
    trace_run_id: str | None = None
    model: str
    pass_count: int
    max_pass_count: int
    risk_band: str


class EvalScenariosResponse(BaseModel):
    rows: list[EvalScenarioRow]


class EvalFailureDetail(BaseModel):
    scenario_id: str
    label: str
    customer_name: str
    expected_action_band: str
    actual_action: str
    risk_band: str
    likely_cause: str
    trace_run_id: str | None = None


class EvalRunDetailResponse(BaseModel):
    eval_run_id: str
    summary: EvalSummaryMetrics
    latest_eval_run: EvalLatestRun
    failures: list[EvalFailureDetail]
    models: list[str]
    notes: list[str]


class EvalRunActionResponse(BaseModel):
    eval_run_id: str
    status: str
    message: str
