# Model Evaluation

## Purpose

This document records the first live model-evaluation pass for the case-review workflow.

The goal was to validate that:

- structured outputs are returned reliably
- recommendations are sensible across multiple realistic case types
- the default model is cost-effective without obvious quality loss
- weaker models can be detected before being exposed to users

## Scope Of The First Eval Pass

The evaluation currently targets the first real AI-powered action in the app:

- `Run AI Review` on the customer case page

It does **not** yet cover:

- simulator live AI runs
- LangGraph multi-node workflows
- LangSmith tracing-based grading
- approval resume/revision AI behavior

## Eval Harness

Script:

- `backend/scripts/evaluate_case_review.py`

Dataset:

- `backend/app/data/eval_cases.py`

The harness builds case payloads from the demo dataset and runs live reviews through the current LiteLLM service.

It scores each result on:

- schema validity
- expected risk-band alignment
- action intent alignment
- policy-language alignment
- minimum next-step completeness
- minimum risk-driver completeness
- valid score range

## Scenario Coverage

Current eval dataset:

- `critical_hard_stop`
- `critical_strategic_exception`
- `high_broken_promises`
- `watchlist_borderline`
- `low_healthy_baseline`
- `fallback_new_high_priority`
- `watchlist_case_012_worsened`
- `watchlist_case_012_improved`

This gives a mix of:

- critical policy-driven cases
- strategic exception cases
- high-risk non-strategic delinquency
- borderline watchlist behavior
- healthy baseline accounts
- fallback-detail generated cases
- improved and worsened scenario variants

## Models Evaluated

Compared models:

- `openai/gpt-5.4-mini`
- `openai/gpt-5.1`
- `openai/gpt-5.2`
- `openai/gpt-5.4-nano`

## Result Summary

Strict comparison results were written to:

- `backend/eval-results/case-review-model-comparison-strict.json`

Repeatability results for the leading model were written to:

- `backend/eval-results/gpt54mini-repeatability.json`

### Strict comparison

| Model | Runs | Perfect Runs | Pass Rate | Notable Result |
| --- | ---: | ---: | ---: | --- |
| `openai/gpt-5.4-mini` | 8 | 8 | 1.0000 | Clean across all current scenarios |
| `openai/gpt-5.1` | 8 | 8 | 1.0000 | Clean, but more verbose than necessary |
| `openai/gpt-5.2` | 8 | 8 | 1.0000 | Clean, but more forceful / enterprise-heavy |
| `openai/gpt-5.4-nano` | 8 | 6 | 0.9643 | Miscalibrated risk band on 2 cases |

### Repeatability for `openai/gpt-5.4-mini`

- runs: `24`
- perfect runs: `24`
- pass rate: `1.0000`
- structured output failures: `0`
- risk-band failures: `0`
- action failures: `0`
- policy failures: `0`

## Practical Recommendation

Current default recommendation:

- use `openai/gpt-5.4-mini` for live case review

Reasoning:

- matched the stronger models on the current eval set
- stayed more concise than `gpt-5.1` and `gpt-5.2`
- outperformed `gpt-5.4-nano` on stricter severity calibration
- is the best quality/cost balance among the tested candidates so far

## Important Cautions

These results are strong, but they do **not** prove universal correctness.

Current limits:

- only 8 scenarios are in the first eval dataset
- only the single-step live review is covered
- grading is heuristic, not human-judged
- the fallback-detail cases are less rich than the fully authored cases

So the correct interpretation is:

> `gpt-5.4-mini` is currently the best default candidate for this workflow, based on the present dataset and rubric.

Not:

> the model is perfect in all future situations

## Next Eval Improvements

Recommended next upgrades:

1. add more authored case-detail records so fewer evals rely on fallback detail
2. increase the scenario set to at least 12-16 cases
3. add human review labels for a subset of recommendations
4. score approval correctness more explicitly
5. add simulator-specific live AI evals
6. later connect eval runs to LangSmith traces

