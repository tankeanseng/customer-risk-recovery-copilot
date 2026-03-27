from app.schemas.optimization import (
    OptimizationHistoryRow,
    OptimizationRunDetailResponse,
    OptimizationRunsResponse,
    OptimizationSampleComparison,
    OptimizationSampleOutput,
    OptimizationSummaryMetrics,
    OptimizationSummaryResponse,
)

SUMMARY = OptimizationSummaryMetrics(
    target_task="recovery_recommendation_quality",
    optimization_framework="DSPy",
    baseline_version="rec_v1",
    optimized_version="rec_v2",
    baseline_score=0.84,
    optimized_score=0.89,
    improvement_delta=0.05,
)

RUNS = [
    OptimizationHistoryRow(
        optimization_run_id="opt_20260325_01",
        target_task="recovery_recommendation_quality",
        baseline_score=0.84,
        best_score=0.89,
        candidate_count=12,
        completed_at="2026-03-25T07:18:00Z",
    ),
    OptimizationHistoryRow(
        optimization_run_id="opt_20260318_01",
        target_task="recovery_recommendation_quality",
        baseline_score=0.81,
        best_score=0.84,
        candidate_count=9,
        completed_at="2026-03-18T06:42:00Z",
    ),
]

SAMPLE_COMPARISON = OptimizationSampleComparison(
    case_id="case_005",
    customer_name="Silverline Engineering Supplies Pte Ltd",
    baseline_output=OptimizationSampleOutput(
        recommended_action="Schedule customer review",
        reasoning_summary="Moderate account deterioration detected.",
    ),
    optimized_output=OptimizationSampleOutput(
        recommended_action="Escalate to account review and prepare credit limit reduction assessment",
        reasoning_summary="Combined decline in orders and worsening payment behavior increases recovery urgency.",
    ),
    explanation_of_gain=(
        "The optimized version is less vague, captures both commercial and credit deterioration, and recommends a more actionable next step."
    ),
)


def get_optimization_summary() -> OptimizationSummaryResponse:
    return OptimizationSummaryResponse(
        summary=SUMMARY,
        experiment_history=RUNS,
        sample_comparison=SAMPLE_COMPARISON,
    )


def list_optimization_runs() -> OptimizationRunsResponse:
    return OptimizationRunsResponse(rows=RUNS)


def get_optimization_run(optimization_run_id: str) -> OptimizationRunDetailResponse:
    run = next((item for item in RUNS if item.optimization_run_id == optimization_run_id), None)
    if run is None:
        raise KeyError(optimization_run_id)

    return OptimizationRunDetailResponse(
        optimization_run_id=run.optimization_run_id,
        summary=SUMMARY,
        candidate_count=run.candidate_count,
        best_score=run.best_score,
        completed_at=run.completed_at,
        sample_comparison=SAMPLE_COMPARISON,
        notes=[
            "This page currently uses a saved optimization snapshot rather than running live DSPy optimization in the app.",
            "The optimization story is anchored to the case-review task, which already has a live evaluation harness.",
        ],
    )
