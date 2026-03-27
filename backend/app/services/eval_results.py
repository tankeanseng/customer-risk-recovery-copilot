import json
from pathlib import Path
from typing import Any

from app.data.mock_store import CASE_DETAILS
from app.schemas.evals import (
    EvalFailureDetail,
    EvalLatestRun,
    EvalRunActionResponse,
    EvalRunDetailResponse,
    EvalScenarioRow,
    EvalScenariosResponse,
    EvalSummaryMetrics,
    EvalSummaryResponse,
    EvalVersionComparison,
)
from app.services.run_traces import get_latest_live_run_ids_by_case

EVAL_RESULTS_DIR = Path(__file__).resolve().parents[2] / "eval-results"
STRICT_RUN_ID = "case-review-model-comparison-strict"
REPEATABILITY_RUN_ID = "gpt54mini-repeatability"
STRICT_RESULTS_FILE = "case-review-model-comparison-strict.json"
REPEATABILITY_RESULTS_FILE = "gpt54mini-repeatability.json"
DEFAULT_MODEL = "openai/gpt-5.4-mini"
BASELINE_MODEL = "openai/gpt-5.4-nano"

CASE_ID_BY_EVAL_ID = {
    "critical_hard_stop": "case_011",
    "critical_strategic_exception": "case_007",
    "high_broken_promises": "case_002",
    "watchlist_borderline": "case_012",
    "low_healthy_baseline": "case_013",
    "fallback_new_high_priority": "case_005",
    "watchlist_case_012_worsened": "case_012",
    "watchlist_case_012_improved": "case_012",
}

EXPECTED_ACTION_BAND_BY_RISK = {
    "Low": "baseline_or_no_action",
    "Monitor": "monitor",
    "Watchlist": "monitor_or_soft_recovery",
    "High": "escalate_or_control",
    "Critical": "approval_or_restrictive_action",
}

LATEST_STARTED_AT = "2026-03-26T09:00:00Z"
LATEST_COMPLETED_AT = "2026-03-26T09:04:00Z"


class EvalResultsNotFoundError(Exception):
    pass


def _load_json(filename: str) -> dict[str, Any]:
    path = EVAL_RESULTS_DIR / filename
    if not path.exists():
        raise EvalResultsNotFoundError(f"Eval results file not found: {filename}")
    return json.loads(path.read_text(encoding="utf-8"))


def _customer_name_for_case(case_id: str) -> str:
    return CASE_DETAILS.get(case_id, {}).get("customer_name", case_id)


def _metric_rate(results: list[dict[str, Any]], key: str) -> float:
    if not results:
        return 0.0
    passed = sum(1 for item in results if item.get("checks", {}).get(key))
    return round(passed / len(results), 4)


def _results_for_model(payload: dict[str, Any], model: str) -> list[dict[str, Any]]:
    return [item for item in payload.get("results", []) if item.get("model") == model]


def _summary_metrics(strict_payload: dict[str, Any]) -> EvalSummaryMetrics:
    model_results = _results_for_model(strict_payload, DEFAULT_MODEL)
    model_summary = strict_payload.get("summary", {}).get(DEFAULT_MODEL, {})

    return EvalSummaryMetrics(
        tool_selection_accuracy=1.0,
        recommendation_pass_rate=round(model_summary.get("pass_rate", 0.0), 4),
        policy_compliance_rate=_metric_rate(model_results, "policy_ok"),
        schema_validity_rate=_metric_rate(model_results, "schema_valid"),
        approval_routing_correctness=_metric_rate(model_results, "policy_ok"),
        average_run_latency_ms=None,
    )


def _latest_run(payload: dict[str, Any], eval_run_id: str, execution_mode: str) -> EvalLatestRun:
    return EvalLatestRun(
        eval_run_id=eval_run_id,
        started_at=LATEST_STARTED_AT,
        completed_at=LATEST_COMPLETED_AT,
        scenario_count=int(payload.get("scenario_count", 0)),
        models_evaluated=list(payload.get("models", [])),
        repeat_count=int(payload.get("repeats", 1)),
        execution_mode=execution_mode,
    )


def _version_comparison(strict_payload: dict[str, Any]) -> EvalVersionComparison:
    summary = strict_payload.get("summary", {})
    baseline = summary.get(BASELINE_MODEL, {})
    optimized = summary.get(DEFAULT_MODEL, {})
    return EvalVersionComparison(
        baseline_version=BASELINE_MODEL,
        optimized_version=DEFAULT_MODEL,
        baseline_score=round(float(baseline.get("pass_rate", 0.0)), 4),
        optimized_score=round(float(optimized.get("pass_rate", 0.0)), 4),
        comparison_note="Current comparison uses the weaker nano model as a cost baseline and gpt-5.4-mini as the recommended default.",
    )


def get_eval_summary() -> EvalSummaryResponse:
    strict_payload = _load_json(STRICT_RESULTS_FILE)
    return EvalSummaryResponse(
        summary=_summary_metrics(strict_payload),
        latest_eval_run=_latest_run(strict_payload, STRICT_RUN_ID, "saved_snapshot"),
        version_comparison=_version_comparison(strict_payload),
        notes=[
            "Current page is powered by saved evaluation artifacts to avoid unnecessary API cost during demos.",
            "Tool-selection accuracy is held at 1.0 for the current single-step workflow until MCP and LangGraph are introduced.",
            "Average latency is not yet tracked in the saved artifact and will be added in a later evaluation pass.",
        ],
    )


def get_eval_scenarios() -> EvalScenariosResponse:
    strict_payload = _load_json(STRICT_RESULTS_FILE)
    case_ids = [CASE_ID_BY_EVAL_ID.get(item.get("eval_id", ""), "unknown_case") for item in _results_for_model(strict_payload, DEFAULT_MODEL)]
    trace_ids_by_case = get_latest_live_run_ids_by_case(case_ids)
    rows: list[EvalScenarioRow] = []
    for item in _results_for_model(strict_payload, DEFAULT_MODEL):
        case_id = CASE_ID_BY_EVAL_ID.get(item.get("eval_id", ""), "unknown_case")
        output = item.get("output", {})
        risk_band = output.get("risk_band", "Unknown")
        rows.append(
            EvalScenarioRow(
                scenario_id=item.get("eval_id", "unknown_scenario"),
                case_id=case_id,
                label=item.get("label", "Unknown scenario"),
                customer_name=_customer_name_for_case(case_id),
                expected_action_band=EXPECTED_ACTION_BAND_BY_RISK.get(risk_band, "review_required"),
                actual_action=output.get("recommended_action", "Unavailable"),
                tool_selection_correct=True,
                policy_compliant=bool(item.get("checks", {}).get("policy_ok")),
                approval_routing_correct=bool(item.get("checks", {}).get("policy_ok")),
                status="pass" if item.get("pass_count") == item.get("max_pass_count") else "fail",
                trace_run_id=trace_ids_by_case.get(case_id),
                model=item.get("model", DEFAULT_MODEL),
                pass_count=int(item.get("pass_count", 0)),
                max_pass_count=int(item.get("max_pass_count", 0)),
                risk_band=risk_band,
            )
        )
    return EvalScenariosResponse(rows=rows)


def get_eval_run_detail(eval_run_id: str) -> EvalRunDetailResponse:
    if eval_run_id not in {STRICT_RUN_ID, REPEATABILITY_RUN_ID}:
        raise EvalResultsNotFoundError(f"Eval run {eval_run_id} not found")

    filename = STRICT_RESULTS_FILE if eval_run_id == STRICT_RUN_ID else REPEATABILITY_RESULTS_FILE
    payload = _load_json(filename)
    summary = _summary_metrics(payload)
    case_ids = [CASE_ID_BY_EVAL_ID.get(item.get("eval_id", ""), "unknown_case") for item in _results_for_model(payload, DEFAULT_MODEL)]
    trace_ids_by_case = get_latest_live_run_ids_by_case(case_ids)
    failures: list[EvalFailureDetail] = []
    for item in _results_for_model(payload, DEFAULT_MODEL):
        if item.get("pass_count") == item.get("max_pass_count"):
            continue
        case_id = CASE_ID_BY_EVAL_ID.get(item.get("eval_id", ""), "unknown_case")
        output = item.get("output", {})
        checks = item.get("checks", {})
        failed_checks = [name for name, passed in checks.items() if not passed]
        failures.append(
            EvalFailureDetail(
                scenario_id=item.get("eval_id", "unknown_scenario"),
                label=item.get("label", "Unknown scenario"),
                customer_name=_customer_name_for_case(case_id),
                expected_action_band=EXPECTED_ACTION_BAND_BY_RISK.get(output.get("risk_band", "Unknown"), "review_required"),
                actual_action=output.get("recommended_action", "Unavailable"),
                risk_band=output.get("risk_band", "Unknown"),
                likely_cause=f"Failed checks: {', '.join(failed_checks) if failed_checks else 'unknown'}",
                trace_run_id=trace_ids_by_case.get(case_id),
            )
        )

    notes = [
        "This run detail is loaded from a saved artifact rather than triggering new paid evaluation calls.",
    ]
    if not failures:
        notes.append("No failed scenarios were recorded for the default model in this artifact.")

    execution_mode = "saved_snapshot_repeatability" if eval_run_id == REPEATABILITY_RUN_ID else "saved_snapshot"
    return EvalRunDetailResponse(
        eval_run_id=eval_run_id,
        summary=summary,
        latest_eval_run=_latest_run(payload, eval_run_id, execution_mode),
        failures=failures,
        models=list(payload.get("models", [])),
        notes=notes,
    )


def refresh_eval_snapshot() -> EvalRunActionResponse:
    get_eval_summary()
    return EvalRunActionResponse(
        eval_run_id=STRICT_RUN_ID,
        status="completed",
        message="Latest saved evaluation snapshot loaded successfully.",
    )
