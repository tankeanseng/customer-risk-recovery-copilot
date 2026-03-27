import json
import os
from typing import Any

from litellm import completion
from langsmith import traceable
from pydantic import ValidationError

from app.schemas.cases import LiveCaseReviewOutput

TRACE_SCHEMA_VERSION = "v1"


class LiveReviewUnavailableError(Exception):
    pass


def is_live_review_enabled() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def _normalize_tag(value: str) -> str:
    return (
        value.strip()
        .lower()
        .replace("&", "and")
        .replace("/", "-")
        .replace(" ", "-")
    )


def build_case_review_trace_metadata(
    case_payload: dict[str, Any],
    provider_model: str | None = None,
    attempt: int | None = None,
) -> dict[str, Any]:
    triage = case_payload.get("triage", {})
    strategic_value = str(case_payload.get("strategic", "")).lower()
    metadata: dict[str, Any] = {
        "trace_schema_version": TRACE_SCHEMA_VERSION,
        "workflow_name": "live_case_review",
        "review_surface": "customer_case_page",
        "case_id": case_payload.get("case_id"),
        "customer_name": case_payload.get("customer_name"),
        "segment": case_payload.get("segment"),
        "region": case_payload.get("region"),
        "tier": case_payload.get("tier"),
        "strategic": strategic_value,
        "baseline_risk_band": case_payload.get("baseline_risk_band"),
        "baseline_risk_score": case_payload.get("baseline_risk_score"),
        "triage_score": triage.get("triage_score"),
        "triage_risk_band": triage.get("risk_band"),
        "hard_trigger_hit": triage.get("hard_trigger_hit"),
        "case_source": triage.get("case_source"),
    }
    if provider_model is not None:
        metadata["provider_model"] = provider_model
    if attempt is not None:
        metadata["attempt"] = attempt
    return metadata


def build_case_review_trace_tags(case_payload: dict[str, Any]) -> list[str]:
    strategic_value = str(case_payload.get("strategic", "")).lower()
    return [
        "workflow:case-review",
        f"risk-band:{_normalize_tag(str(case_payload.get('baseline_risk_band', 'unknown')))}",
        f"segment:{_normalize_tag(str(case_payload.get('segment', 'unknown')))}",
        f"region:{_normalize_tag(str(case_payload.get('region', 'unknown')))}",
        "strategic" if strategic_value in {"yes", "true"} else "non-strategic",
    ]


@traceable(name="case_review_model_call", run_type="llm")
def _invoke_review_model(provider_model: str, messages: list[dict[str, str]]) -> dict[str, Any]:
    response = completion(
        model=provider_model,
        messages=messages,
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    content = response["choices"][0]["message"]["content"]
    return {
        "provider_model": provider_model,
        "content": content,
    }


def execute_live_case_review_logic(case_payload: dict[str, Any], model_override: str | None = None) -> tuple[LiveCaseReviewOutput, str]:
    if not is_live_review_enabled():
        raise LiveReviewUnavailableError("OPENAI_API_KEY is not configured.")

    model = model_override or os.getenv("OPENAI_MODEL_DEFAULT", "gpt-5.4-mini")
    provider_model = model if "/" in model else f"openai/{model}"

    messages = [
        {
            "role": "system",
            "content": (
                "You are a senior accounts-receivable risk analyst for a B2B distributor. "
                "Review the customer case and return only valid JSON. "
                "Use these exact keys: risk_band, risk_score, customer_summary, risk_summary, "
                "recommended_action, why_now, policy_status, next_steps, risk_drivers, policy_summary. "
                "risk_band must be one of Low, Monitor, Watchlist, High, Critical. "
                "risk_score must be an integer from 0 to 100. "
                "next_steps, risk_drivers, and policy_summary must each be arrays of short strings."
            ),
        },
        {
            "role": "user",
            "content": json.dumps(case_payload, ensure_ascii=True, indent=2),
        },
    ]

    last_error: str | None = None

    for attempt in range(2):
        response = _invoke_review_model(
            provider_model,
            messages,
            langsmith_extra={
                "metadata": {
                    **build_case_review_trace_metadata(
                        case_payload,
                        provider_model=provider_model,
                        attempt=attempt + 1,
                    ),
                    "message_count": len(messages),
                    "response_format": "json_object",
                },
                "tags": ["span:model-call"],
            },
        )
        content = response["content"]

        try:
            parsed = LiveCaseReviewOutput.model_validate_json(content)
            return parsed, provider_model
        except ValidationError as exc:
            last_error = str(exc)
            messages.append({"role": "assistant", "content": content})
            messages.append(
                {
                    "role": "user",
                    "content": (
                        "Your previous response did not match the required JSON schema. "
                        f"Validation error: {last_error}. "
                        "Return corrected JSON only."
                    ),
                }
            )

    raise LiveReviewUnavailableError(last_error or "The live AI review did not produce valid structured output.")


@traceable(name="live_case_review", run_type="chain")
def run_live_case_review(case_payload: dict[str, Any], model_override: str | None = None) -> tuple[LiveCaseReviewOutput, str]:
    return execute_live_case_review_logic(case_payload, model_override=model_override)
