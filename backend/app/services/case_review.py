import json
import os
from typing import Any

from litellm import completion
from pydantic import ValidationError

from app.schemas.cases import LiveCaseReviewOutput


class LiveReviewUnavailableError(Exception):
    pass


def is_live_review_enabled() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def run_live_case_review(case_payload: dict[str, Any], model_override: str | None = None) -> tuple[LiveCaseReviewOutput, str]:
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
        response = completion(
            model=provider_model,
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        content = response["choices"][0]["message"]["content"]

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
