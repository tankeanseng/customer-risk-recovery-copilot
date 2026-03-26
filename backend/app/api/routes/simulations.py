from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.data.mock_store import SAVED_SIMULATIONS, SIMULATION_DETAILS
from app.schemas.cases import CaseActionResponse
from app.schemas.simulations import (
    AgentChangeSummary,
    PolicyImpact,
    SavedSimulationSummary,
    ScenarioInputs,
    SimulationDeltaReport,
    SimulationExplanation,
    SimulationListResponse,
    SimulationResponse,
    SimulationRunMeta,
    SimulationSummary,
    TraceReference,
)

router = APIRouter()


@router.post("/cases/{case_id}/simulate", response_model=SimulationResponse)
async def simulate_case(case_id: str, inputs: ScenarioInputs) -> SimulationResponse:
    if case_id != "case_012":
        raise HTTPException(status_code=404, detail=f"No simulation demo configured for {case_id}")

    baseline = SIMULATION_DETAILS["sim_301"].baseline
    score = baseline.risk_score
    changed_inputs: list[str] = []
    changed_drivers: list[str] = []
    policy_rules: list[str] = []

    if inputs.days_overdue_delta != 0:
        changed_inputs.append("days_overdue_delta")
        score += max(0, inputs.days_overdue_delta) * 1
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

    changed_inputs.extend(
        field
        for field, active in [
            ("order_trend_state", inputs.order_trend_state != "declining"),
            ("dispute_status", inputs.dispute_status != "closed"),
            ("strategic_flag", inputs.strategic_flag),
            ("credit_limit", inputs.credit_limit != 110000),
            ("payment_terms_days", inputs.payment_terms_days != 30),
            ("account_manager_confidence", inputs.account_manager_confidence != 42),
        ]
        if active and field not in changed_inputs
    )

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
        score += 4
        changed_drivers.append("Strategic account requires exception caution")

    if inputs.credit_limit < 100000:
        score += 3
        changed_drivers.append("Reduced credit headroom increases control urgency")

    if inputs.payment_terms_days <= 21:
        score += 2
    elif inputs.payment_terms_days >= 45:
        score -= 2

    if inputs.account_manager_confidence >= 65:
        score -= 4
        changed_drivers.append("Relationship confidence improved")
    elif inputs.account_manager_confidence <= 40:
        score += 5
        changed_drivers.append("Account owner confidence is weakening")

    score = max(20, min(score, 96))

    if score >= 82:
        risk_level = "Critical"
        recommended_action = "Pause new credit orders and escalate to finance manager approval"
    elif score >= 74:
        risk_level = "High"
        recommended_action = "Escalate to finance manager and prepare credit limit reduction review"
    elif score >= 58:
        risk_level = "Watchlist"
        recommended_action = "Schedule monitored recovery call and review payment progress in 7 days"
    elif score >= 42:
        risk_level = "Monitor"
        recommended_action = "Monitor with tighter follow-up cadence"
    else:
        risk_level = "Low"
        recommended_action = "No immediate action; continue baseline monitoring"

    approval_required = risk_level in {"High", "Critical"} or inputs.strategic_flag

    if approval_required:
        policy_rules.append("Manager approval now mandatory")
    if inputs.days_overdue_delta >= 10 or inputs.outstanding_balance_delta >= 7500:
        policy_rules.append("High exposure escalation threshold")
    if inputs.broken_promises_count_delta > 0:
        policy_rules.append("Repeated commitment breach watch rule")
    if inputs.dispute_status == "open":
        policy_rules.append("Dispute moderation rule")

    scenario_result = SimulationSummary(
        risk_level=risk_level,
        risk_score=score,
        recommended_action=recommended_action,
        approval_required=approval_required,
        top_drivers=(changed_drivers or ["Scenario changes did not materially alter key drivers"])[:3],
    )

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    simulation_id = "sim_live_case_012"
    return SimulationResponse(
        simulation=SimulationRunMeta(
            simulation_id=simulation_id,
            case_id=case_id,
            scenario_name="Live Scenario",
            status="completed",
            started_at=now,
            ended_at=now,
            duration_ms=2400,
        ),
        inputs=inputs,
        baseline=baseline,
        scenario_result=scenario_result,
        delta_report=SimulationDeltaReport(
            changed_inputs=changed_inputs or ["none"],
            risk_level_before=baseline.risk_level,
            risk_level_after=scenario_result.risk_level,
            action_before=baseline.recommended_action,
            action_after=scenario_result.recommended_action,
            top_changed_drivers=(changed_drivers or ["No major recommendation shift"])[:3],
            policy_impact=PolicyImpact(
                newly_triggered_rules=policy_rules or ["No new policy rules triggered"],
                approval_state_changed=baseline.approval_required != scenario_result.approval_required,
            ),
        ),
        explanation=SimulationExplanation(
            summary=(
                "The simulation recalculated the recommendation using the updated customer profile, payment stress, "
                "and relationship signals."
            ),
            agent_changes=[
                AgentChangeSummary(
                    agent="Financial Risk Agent",
                    change=f"Risk score moved from {baseline.risk_score} to {scenario_result.risk_score}.",
                ),
                AgentChangeSummary(
                    agent="Policy Check Agent",
                    change=(
                        "Approval is now required."
                        if scenario_result.approval_required
                        else "Approval is no longer required."
                    ),
                ),
            ],
        ),
        trace_reference=TraceReference(
            simulation_run_id="run_sim_301",
            trace_available=True,
        ),
    )


@router.get("/cases/{case_id}/simulations", response_model=SimulationListResponse)
async def list_simulations(case_id: str) -> SimulationListResponse:
    simulations = SAVED_SIMULATIONS.get(case_id)
    if simulations is None:
        raise HTTPException(status_code=404, detail=f"No saved simulations for {case_id}")
    return simulations


@router.get("/simulations/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(simulation_id: str) -> SimulationResponse:
    simulation = SIMULATION_DETAILS.get(simulation_id)
    if simulation is None:
        raise HTTPException(status_code=404, detail=f"Simulation {simulation_id} not found")
    return simulation


@router.post("/simulations/{simulation_id}/save", response_model=CaseActionResponse)
async def save_simulation(simulation_id: str) -> CaseActionResponse:
    simulation = SIMULATION_DETAILS.get(simulation_id)
    if simulation is None:
        raise HTTPException(status_code=404, detail=f"Simulation {simulation_id} not found")
    return CaseActionResponse(
        case_id=simulation.simulation.case_id,
        status="saved",
        message=f"Scenario '{simulation.simulation.scenario_name}' saved.",
    )


@router.delete("/simulations/{simulation_id}", response_model=CaseActionResponse)
async def delete_simulation(simulation_id: str) -> CaseActionResponse:
    simulation = SIMULATION_DETAILS.get(simulation_id)
    if simulation is None:
        raise HTTPException(status_code=404, detail=f"Simulation {simulation_id} not found")
    return CaseActionResponse(
        case_id=simulation.simulation.case_id,
        status="deleted",
        message=f"Scenario '{simulation.simulation.scenario_name}' removed.",
    )
