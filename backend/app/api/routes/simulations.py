from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.schemas.cases import CaseActionResponse
from app.services.case_payloads import build_case_detail
from app.services.case_review import (
    LiveReviewUnavailableError,
    build_case_review_trace_tags,
    is_live_review_enabled,
    policy_status_requires_approval,
)
from app.services.run_traces import get_latest_live_run_for_case, wait_for_live_run_by_id
from app.services.runtime_state import load_runtime_state, save_runtime_state
from app.services.simulation_review import (
    apply_scenario_to_case_payload,
    build_simulation_baseline,
    build_simulation_delta_report,
    build_simulation_summary_from_review,
)
from app.workflows.case_review_graph import build_graph_trace_metadata, run_case_review_graph
from app.schemas.simulations import (
    AgentChangeSummary,
    SavedSimulationSummary,
    SimulationExplanation,
    SimulationListResponse,
    SimulationResponse,
    SimulationRunRequest,
    SimulationRunMeta,
    TraceReference,
)

router = APIRouter()


@router.post("/cases/{case_id}/simulate", response_model=SimulationResponse)
def simulate_case(case_id: str, request: SimulationRunRequest) -> SimulationResponse:
    if case_id != "case_012":
        raise HTTPException(status_code=404, detail=f"No simulation demo configured for {case_id}")

    inputs = request.inputs
    scenario_name = request.scenario_name.strip() if request.scenario_name else "Custom Scenario"
    detail = build_case_detail(case_id)
    baseline = build_simulation_baseline(case_id)
    scenario_payload, changed_inputs, changed_drivers, policy_rules = apply_scenario_to_case_payload(detail, inputs)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    simulation_id = f"sim_live_{case_id}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    state = load_runtime_state()

    if is_live_review_enabled():
        try:
            review, model_used, trace_run_id = run_case_review_graph(
                scenario_payload,
                langsmith_extra={
                    "metadata": {
                        **build_graph_trace_metadata(scenario_payload),
                        "review_surface": "simulator_page",
                        "simulation_mode": True,
                    },
                    "tags": [*build_case_review_trace_tags(scenario_payload), "surface:simulator"],
                },
            )
            exact_trace = wait_for_live_run_by_id(trace_run_id) if trace_run_id is not None else None
            latest_trace = exact_trace or get_latest_live_run_for_case(case_id)
            approval_required = (
                review.risk_band in {"High", "Critical"}
                or policy_status_requires_approval(review.policy_status)
                or scenario_payload["triage"]["hard_trigger_hit"]
            )
            scenario_result = build_simulation_summary_from_review(review, approval_required=approval_required)
            delta_report = build_simulation_delta_report(
                baseline=baseline,
                scenario_result=scenario_result,
                changed_inputs=changed_inputs,
                changed_drivers=changed_drivers,
                policy_rules=policy_rules,
            )
            response = SimulationResponse(
                simulation=SimulationRunMeta(
                    simulation_id=simulation_id,
                    case_id=case_id,
                    scenario_name=scenario_name,
                    status="completed",
                    started_at=now,
                    ended_at=now,
                    duration_ms=4200,
                    model_used=model_used,
                ),
                inputs=inputs,
                baseline=baseline,
                scenario_result=scenario_result,
                delta_report=delta_report,
                explanation=SimulationExplanation(
                    summary=(
                        "The simulator reran the live AI review workflow on a scenario-adjusted customer case payload, "
                        "including MCP context lookups and LangGraph orchestration."
                    ),
                    agent_changes=[
                        AgentChangeSummary(
                            agent="Financial Risk Agent",
                            change=f"Risk moved from {baseline.risk_level} ({baseline.risk_score}) to {scenario_result.risk_level} ({scenario_result.risk_score}).",
                        ),
                        AgentChangeSummary(
                            agent="Policy Check Agent",
                            change=(
                                "Approval is now required."
                                if delta_report.policy_impact.approval_state_changed and scenario_result.approval_required
                                else "Approval requirement is unchanged."
                            ),
                        ),
                        AgentChangeSummary(
                            agent="Model Runtime",
                            change=f"Simulation used {model_used} for the live scenario review.",
                        ),
                    ],
                ),
                trace_reference=TraceReference(
                    simulation_run_id=(exact_trace.run.run_id if exact_trace is not None else (latest_trace.run.run_id if latest_trace is not None else "run_sim_unavailable")),
                    trace_available=latest_trace is not None,
                ),
            )
            state.simulation_details[simulation_id] = response
            save_runtime_state(state)
            return response
        except (LiveReviewUnavailableError, Exception):
            pass

    baseline_demo = state.simulation_details["sim_301"].baseline
    response = SimulationResponse(
        simulation=SimulationRunMeta(
            simulation_id=simulation_id,
            case_id=case_id,
            scenario_name=scenario_name,
            status="completed",
            started_at=now,
            ended_at=now,
            duration_ms=2400,
            model_used=None,
        ),
        inputs=inputs,
        baseline=baseline_demo,
        scenario_result=baseline_demo,
        delta_report=build_simulation_delta_report(
            baseline=baseline_demo,
            scenario_result=baseline_demo,
            changed_inputs=changed_inputs,
            changed_drivers=changed_drivers,
            policy_rules=policy_rules,
        ),
        explanation=SimulationExplanation(
            summary=(
                "The simulation fell back to demo mode because live AI simulation was unavailable."
            ),
            agent_changes=[
                AgentChangeSummary(
                    agent="Financial Risk Agent",
                    change="Using saved demo simulation output.",
                ),
            ],
        ),
        trace_reference=TraceReference(
            simulation_run_id="run_sim_301_demo",
            trace_available=False,
        ),
    )
    state.simulation_details[simulation_id] = response
    save_runtime_state(state)
    return response


@router.get("/cases/{case_id}/simulations", response_model=SimulationListResponse)
async def list_simulations(case_id: str) -> SimulationListResponse:
    simulations = load_runtime_state().saved_simulations.get(case_id)
    if simulations is None:
        raise HTTPException(status_code=404, detail=f"No saved simulations for {case_id}")
    return simulations


@router.get("/simulations/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(simulation_id: str) -> SimulationResponse:
    simulation = load_runtime_state().simulation_details.get(simulation_id)
    if simulation is None:
        raise HTTPException(status_code=404, detail=f"Simulation {simulation_id} not found")
    return simulation


@router.post("/simulations/{simulation_id}/save", response_model=CaseActionResponse)
async def save_simulation(simulation_id: str) -> CaseActionResponse:
    state = load_runtime_state()
    simulation = state.simulation_details.get(simulation_id)
    if simulation is None:
        raise HTTPException(status_code=404, detail=f"Simulation {simulation_id} not found")
    case_id = simulation.simulation.case_id
    saved_list = state.saved_simulations.get(case_id)
    if saved_list is None:
        saved_list = SimulationListResponse(case_id=case_id, saved_scenarios=[])
        state.saved_simulations[case_id] = saved_list
    saved_list.saved_scenarios = [
        summary for summary in saved_list.saved_scenarios if summary.simulation_id != simulation_id
    ]
    saved_list.saved_scenarios.insert(
        0,
        SavedSimulationSummary(
            simulation_id=simulation.simulation.simulation_id,
            scenario_name=simulation.simulation.scenario_name,
            created_at=simulation.simulation.started_at,
            risk_level_after=simulation.scenario_result.risk_level,
            approval_required=simulation.scenario_result.approval_required,
        ),
    )
    simulation.simulation.status = "saved"
    save_runtime_state(state)
    return CaseActionResponse(
        case_id=simulation.simulation.case_id,
        status="saved",
        message=f"Scenario '{simulation.simulation.scenario_name}' saved.",
    )


@router.delete("/simulations/{simulation_id}", response_model=CaseActionResponse)
async def delete_simulation(simulation_id: str) -> CaseActionResponse:
    state = load_runtime_state()
    simulation = state.simulation_details.get(simulation_id)
    if simulation is None:
        raise HTTPException(status_code=404, detail=f"Simulation {simulation_id} not found")
    saved_list = state.saved_simulations.get(simulation.simulation.case_id)
    if saved_list is not None:
        saved_list.saved_scenarios = [
            summary for summary in saved_list.saved_scenarios if summary.simulation_id != simulation_id
        ]
    if simulation_id.startswith("sim_live_"):
        del state.simulation_details[simulation_id]
    save_runtime_state(state)
    return CaseActionResponse(
        case_id=simulation.simulation.case_id,
        status="deleted",
        message=f"Scenario '{simulation.simulation.scenario_name}' removed.",
    )
