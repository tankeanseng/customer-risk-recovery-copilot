from pydantic import BaseModel


class OptimizationSummaryMetrics(BaseModel):
    target_task: str
    optimization_framework: str
    baseline_version: str
    optimized_version: str
    baseline_score: float
    optimized_score: float
    improvement_delta: float


class OptimizationHistoryRow(BaseModel):
    optimization_run_id: str
    target_task: str
    baseline_score: float
    best_score: float
    candidate_count: int
    completed_at: str


class OptimizationSampleOutput(BaseModel):
    recommended_action: str
    reasoning_summary: str


class OptimizationSampleComparison(BaseModel):
    case_id: str
    customer_name: str
    baseline_output: OptimizationSampleOutput
    optimized_output: OptimizationSampleOutput
    explanation_of_gain: str


class OptimizationSummaryResponse(BaseModel):
    summary: OptimizationSummaryMetrics
    experiment_history: list[OptimizationHistoryRow]
    sample_comparison: OptimizationSampleComparison


class OptimizationRunsResponse(BaseModel):
    rows: list[OptimizationHistoryRow]


class OptimizationRunDetailResponse(BaseModel):
    optimization_run_id: str
    summary: OptimizationSummaryMetrics
    candidate_count: int
    best_score: float
    completed_at: str
    sample_comparison: OptimizationSampleComparison
    notes: list[str]
