from typing import Any

from app.schemas.cases import CaseDetailResponse
from app.schemas.common import RiskBand
from app.schemas.simulations import PolicyImpact, ScenarioInputs, SimulationDeltaReport, SimulationSummary
from app.services.case_payloads import build_case_payload
from app.services.runtime_state import load_runtime_state


def _risk_band_for_score(score: int) -> RiskBand:
    if score >= 82:
        return "Critical"
    if score >= 74:
        return "High"
    if score >= 58:
        return "Watchlist"
    if score >= 42:
        return "Monitor"
    return "Low"


def build_simulation_baseline(case_id: str) -> SimulationSummary:
    return load_runtime_state().simulation_details["sim_301"].baseline


def apply_scenario_to_case_payload(detail: CaseDetailResponse, inputs: ScenarioInputs) -> tuple[dict[str, Any], list[str], list[str], list[str]]:
    payload = build_case_payload(detail)
    score = detail.risk_score
    changed_inputs: list[str] = []
    changed_drivers: list[str] = []
    policy_rules: list[str] = []

    if inputs.days_overdue_delta != 0:
        changed_inputs.append("days_overdue_delta")
        score += max(0, inputs.days_overdue_delta)
        if inputs.days_overdue_delta >= 10:
            changed_drivers.append("Overdue threshold pressure increased")

    if inputs.outstanding_balance_delta != 0:
        changed_inputs.append("outstanding_balance_delta")
        score += max(0, int(inputs.outstanding_balance_delta / 2500))
        if inputs.outstanding_balance_delta >= 7500:
            changed_drivers.append("Overdue exposure increased")

    if inputs.partial_payment_amount > 0:
        changed_inputs.append("partial_payment_amount")
        score -= min(10, int(inputs.partial_payment_amount / 1500))
        changed_drivers.append("Partial payment improves recoverability")

    if inputs.broken_promises_count_delta != 0:
        changed_inputs.append("broken_promises_count_delta")
        score += max(0, inputs.broken_promises_count_delta) * 6
        if inputs.broken_promises_count_delta > 0:
            changed_drivers.append("Missed commitment risk increased")

    if inputs.order_trend_state == "sharply_declining":
        score += 10
        changed_drivers.append("Revenue trend deterioration accelerated")
    elif inputs.order_trend_state == "declining":
        score += 5
        changed_drivers.append("Order decline is still active")
    elif inputs.order_trend_state == "recovering":
        score -= 7
        changed_drivers.append("Order trend is recovering")

    if inputs.dispute_status == "open":
        score -= 5
        changed_drivers.append("Open dispute softens direct collections pressure")

    if inputs.strategic_flag:
        changed_inputs.append("strategic_flag")
        score += 4
        changed_drivers.append("Strategic account requires exception caution")

    if inputs.credit_limit != detail.credit_limit:
        changed_inputs.append("credit_limit")
        if inputs.credit_limit < detail.credit_limit:
            score += 3
            changed_drivers.append("Reduced credit headroom increases control urgency")

    if inputs.payment_terms_days != int(detail.payment_terms.replace("Net ", "")):
        changed_inputs.append("payment_terms_days")
        if inputs.payment_terms_days <= 21:
            score += 2
        elif inputs.payment_terms_days >= 45:
            score -= 2

    if inputs.account_manager_confidence != 42:
        changed_inputs.append("account_manager_confidence")
        if inputs.account_manager_confidence >= 65:
            score -= 4
            changed_drivers.append("Relationship confidence improved")
        elif inputs.account_manager_confidence <= 40:
            score += 5
            changed_drivers.append("Account owner confidence is weakening")

    if inputs.dispute_status != "closed":
        changed_inputs.append("dispute_status")
    if inputs.order_trend_state != "declining":
        changed_inputs.append("order_trend_state")

    score = max(20, min(score, 96))
    risk_band = _risk_band_for_score(score)
    approval_watch = risk_band in {"High", "Critical"} or inputs.strategic_flag or inputs.broken_promises_count_delta > 0

    if approval_watch:
        policy_rules.append("Manager approval now mandatory")
    if inputs.days_overdue_delta >= 10 or inputs.outstanding_balance_delta >= 7500:
        policy_rules.append("High exposure escalation threshold")
    if inputs.broken_promises_count_delta > 0:
        policy_rules.append("Repeated commitment breach watch rule")
    if inputs.dispute_status == "open":
        policy_rules.append("Dispute moderation rule")

    payload["baseline_risk_score"] = score
    payload["baseline_risk_band"] = risk_band
    payload["triage"]["triage_score"] = score
    payload["triage"]["risk_band"] = risk_band
    payload["triage"]["hard_trigger_hit"] = approval_watch
    payload["credit_limit"] = inputs.credit_limit
    payload["payment_terms"] = f"Net {inputs.payment_terms_days}"
    payload["strategic"] = "Yes" if inputs.strategic_flag else "No"
    payload["risk_drivers"] = list(dict.fromkeys([*changed_drivers, *payload["risk_drivers"]]))[:6]
    payload["policy_summary"] = list(dict.fromkeys([*policy_rules, *payload["policy_summary"]]))[:6]
    payload["notes"] = [
        (
            "Simulation scenario applied: "
            f"days_overdue_delta={inputs.days_overdue_delta}, "
            f"outstanding_balance_delta={inputs.outstanding_balance_delta}, "
            f"partial_payment_amount={inputs.partial_payment_amount}, "
            f"broken_promises_count_delta={inputs.broken_promises_count_delta}, "
            f"order_trend_state={inputs.order_trend_state}, "
            f"dispute_status={inputs.dispute_status}."
        ),
        *payload["notes"],
    ][:6]
    payload["simulation_context"] = {
        "scenario_inputs": inputs.model_dump(),
        "changed_inputs": changed_inputs,
        "changed_drivers": changed_drivers,
        "policy_rules": policy_rules,
    }
    payload["case_brief"]["risk_summary"] = (
        f"{payload['case_brief']['risk_summary']} "
        f"Simulation adjustments indicate provisional band {risk_band} with score {score}."
    )
    return payload, changed_inputs, changed_drivers, policy_rules


def build_simulation_summary_from_review(review: Any, approval_required: bool) -> SimulationSummary:
    return SimulationSummary(
        risk_level=review.risk_band,
        risk_score=review.risk_score,
        recommended_action=review.recommended_action,
        approval_required=approval_required,
        top_drivers=review.risk_drivers[:3],
    )


def build_simulation_delta_report(
    baseline: SimulationSummary,
    scenario_result: SimulationSummary,
    changed_inputs: list[str],
    changed_drivers: list[str],
    policy_rules: list[str],
) -> SimulationDeltaReport:
    return SimulationDeltaReport(
        changed_inputs=changed_inputs or ["none"],
        risk_level_before=baseline.risk_level,
        risk_level_after=scenario_result.risk_level,
        action_before=baseline.recommended_action,
        action_after=scenario_result.recommended_action,
        top_changed_drivers=(changed_drivers or scenario_result.top_drivers or ["No major recommendation shift"])[:3],
        policy_impact=PolicyImpact(
            newly_triggered_rules=policy_rules or ["No new policy rules triggered"],
            approval_state_changed=baseline.approval_required != scenario_result.approval_required,
        ),
    )
