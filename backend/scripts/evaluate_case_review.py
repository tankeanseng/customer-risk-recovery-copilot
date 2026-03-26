from __future__ import annotations

import argparse
import copy
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from app.data.eval_cases import EVAL_CASES, EVAL_SCENARIO_MUTATIONS
from app.services.case_payloads import build_case_detail, build_case_payload
from app.services.case_review import LiveReviewUnavailableError, run_live_case_review


load_dotenv()


DEFAULT_MODELS = [
    "openai/gpt-5.4-mini",
    "openai/gpt-5.1",
    "openai/gpt-5.2",
    "openai/gpt-5.4-nano",
]


@dataclass
class EvalScenario:
    eval_id: str
    label: str
    payload: dict[str, Any]
    expected_risk_bands: list[str]
    action_keywords_any: list[str]
    required_policy_keywords_any: list[str]


def _merge_dict(base: dict[str, Any], updates: dict[str, Any]) -> dict[str, Any]:
    merged = copy.deepcopy(base)
    for key, value in updates.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _merge_dict(merged[key], value)
        else:
            merged[key] = value
    return merged


def build_eval_scenarios() -> list[EvalScenario]:
    scenarios: list[EvalScenario] = []

    for item in EVAL_CASES:
        detail = build_case_detail(item["case_id"])
        payload = build_case_payload(detail)
        scenarios.append(
            EvalScenario(
                eval_id=item["eval_id"],
                label=item["label"],
                payload=payload,
                expected_risk_bands=item["expected_risk_bands"],
                action_keywords_any=item["action_keywords_any"],
                required_policy_keywords_any=item["required_policy_keywords_any"],
            )
        )

    for item in EVAL_SCENARIO_MUTATIONS:
        detail = build_case_detail(item["base_case_id"])
        payload = build_case_payload(detail)
        payload = _merge_dict(payload, item["mutations"])
        scenarios.append(
            EvalScenario(
                eval_id=item["eval_id"],
                label=item["label"],
                payload=payload,
                expected_risk_bands=item["expected_risk_bands"],
                action_keywords_any=item["action_keywords_any"],
                required_policy_keywords_any=item["required_policy_keywords_any"],
            )
        )

    return scenarios


def contains_any(text: str, keywords: list[str]) -> bool:
    lowered = text.lower()
    return any(keyword.lower() in lowered for keyword in keywords)


def evaluate_once(model: str, scenario: EvalScenario) -> dict[str, Any]:
    result, model_used = run_live_case_review(scenario.payload, model_override=model)

    risk_ok = result.risk_band in scenario.expected_risk_bands
    action_ok = contains_any(result.recommended_action, scenario.action_keywords_any)
    policy_ok = contains_any(result.policy_status, scenario.required_policy_keywords_any) or contains_any(
        " ".join(result.policy_summary), scenario.required_policy_keywords_any
    )
    next_steps_ok = len(result.next_steps) >= 2
    drivers_ok = len(result.risk_drivers) >= 2
    score_range_ok = 0 <= result.risk_score <= 100

    checks = {
        "schema_valid": True,
        "risk_band_ok": risk_ok,
        "action_ok": action_ok,
        "policy_ok": policy_ok,
        "next_steps_ok": next_steps_ok,
        "drivers_ok": drivers_ok,
        "score_range_ok": score_range_ok,
    }
    pass_count = sum(1 for passed in checks.values() if passed)

    return {
        "eval_id": scenario.eval_id,
        "label": scenario.label,
        "model": model_used,
        "checks": checks,
        "pass_count": pass_count,
        "max_pass_count": len(checks),
        "output": result.model_dump(),
    }


def summarize(results: list[dict[str, Any]]) -> dict[str, Any]:
    by_model: dict[str, dict[str, Any]] = {}
    for item in results:
        model = item["model"]
        model_bucket = by_model.setdefault(
            model,
            {
                "runs": 0,
                "perfect_runs": 0,
                "total_passed_checks": 0,
                "total_checks": 0,
                "risk_band_failures": 0,
                "action_failures": 0,
                "policy_failures": 0,
            },
        )
        model_bucket["runs"] += 1
        model_bucket["total_passed_checks"] += item["pass_count"]
        model_bucket["total_checks"] += item["max_pass_count"]
        if item["pass_count"] == item["max_pass_count"]:
            model_bucket["perfect_runs"] += 1
        if not item["checks"]["risk_band_ok"]:
            model_bucket["risk_band_failures"] += 1
        if not item["checks"]["action_ok"]:
            model_bucket["action_failures"] += 1
        if not item["checks"]["policy_ok"]:
            model_bucket["policy_failures"] += 1

    for model, bucket in by_model.items():
        bucket["pass_rate"] = round(bucket["total_passed_checks"] / bucket["total_checks"], 4) if bucket["total_checks"] else 0
        bucket["perfect_run_rate"] = round(bucket["perfect_runs"] / bucket["runs"], 4) if bucket["runs"] else 0

    return by_model


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate live case review quality across models and scenarios.")
    parser.add_argument("--models", nargs="*", default=DEFAULT_MODELS, help="Model ids to evaluate")
    parser.add_argument("--repeats", type=int, default=1, help="Number of repeated runs per scenario and model")
    parser.add_argument(
        "--output",
        default="eval-results/case-review-model-comparison.json",
        help="Relative path to write JSON results",
    )
    args = parser.parse_args()

    if not os.getenv("OPENAI_API_KEY"):
        raise SystemExit("OPENAI_API_KEY is not configured in backend/.env")

    scenarios = build_eval_scenarios()
    results: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    print(f"Running {len(scenarios)} scenarios across {len(args.models)} model(s) with {args.repeats} repeat(s)...")
    for model in args.models:
        print(f"\nModel: {model}")
        for scenario in scenarios:
            for repeat_index in range(args.repeats):
                try:
                    result = evaluate_once(model, scenario)
                    result["repeat_index"] = repeat_index + 1
                    results.append(result)
                    print(
                        f"  {scenario.eval_id} [run {repeat_index + 1}]: {result['pass_count']}/{result['max_pass_count']} "
                        f"| risk={result['output']['risk_band']} | action={result['output']['recommended_action']}"
                    )
                except LiveReviewUnavailableError as exc:
                    failures.append(
                        {"model": model, "eval_id": scenario.eval_id, "repeat_index": repeat_index + 1, "error": str(exc)}
                    )
                    print(f"  {scenario.eval_id} [run {repeat_index + 1}]: ERROR {exc}")
                except Exception as exc:  # pragma: no cover - safety for live eval script
                    failures.append(
                        {"model": model, "eval_id": scenario.eval_id, "repeat_index": repeat_index + 1, "error": repr(exc)}
                    )
                    print(f"  {scenario.eval_id} [run {repeat_index + 1}]: ERROR {exc!r}")

    summary = summarize(results)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(
            {
                "models": args.models,
                "scenario_count": len(scenarios),
                "repeats": args.repeats,
                "results": results,
                "failures": failures,
                "summary": summary,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    print("\nSummary:")
    print(json.dumps(summary, indent=2))
    print(f"\nSaved results to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
