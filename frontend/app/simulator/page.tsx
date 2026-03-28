"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { fetchJson } from "../lib/api";
import { simulationData } from "../lib/demo-data";

type OrderTrendState = "recovering" | "stable" | "declining" | "sharply_declining";
type DisputeStatus = "none" | "open" | "closed";

type ScenarioInputs = {
  daysOverdueDelta: number;
  outstandingBalanceDelta: number;
  partialPaymentAmount: number;
  brokenPromisesCountDelta: number;
  orderTrendState: OrderTrendState;
  disputeStatus: DisputeStatus;
  strategicFlag: boolean;
  creditLimit: number;
  paymentTermsDays: number;
  accountManagerConfidence: number;
};

type SimulationResult = {
  riskLevel: string;
  riskScore: number;
  action: string;
  approvalRequired: string;
  topDrivers: string[];
};

type SavedScenario = {
  simulationId: string;
  name: string;
  risk: string;
  approval: string;
};

type ScenarioSnapshot = {
  simulationId: string;
  name: string;
  inputs: ScenarioInputs;
  result: SimulationResult;
  deltas: string[];
  policyImpact: string[];
  traceReference: TraceReference;
  modelUsed: string | null;
};

type TraceReference = {
  simulationRunId: string;
  traceAvailable: boolean;
};

type ApiSimulationResponse = {
  simulation: {
    simulation_id: string;
    scenario_name: string;
    model_used: string | null;
  };
  inputs: {
    days_overdue_delta: number;
    outstanding_balance_delta: number;
    partial_payment_amount: number;
    broken_promises_count_delta: number;
    order_trend_state: OrderTrendState;
    dispute_status: DisputeStatus;
    strategic_flag: boolean;
    credit_limit: number;
    payment_terms_days: number;
    account_manager_confidence: number;
  };
  scenario_result: {
    risk_level: string;
    risk_score: number;
    recommended_action: string;
    approval_required: boolean;
    top_drivers: string[];
  };
  delta_report: {
    top_changed_drivers: string[];
    policy_impact: {
      newly_triggered_rules: string[];
    };
  };
  explanation: {
    summary: string;
  };
  trace_reference: {
    simulation_run_id: string;
    trace_available: boolean;
  };
};

type ApiSimulationListResponse = {
  saved_scenarios: Array<{
    simulation_id: string;
    scenario_name: string;
    risk_level_after: string;
    approval_required: boolean;
  }>;
};

const INITIAL_INPUTS: ScenarioInputs = {
  daysOverdueDelta: 14,
  outstandingBalanceDelta: 8500,
  partialPaymentAmount: 0,
  brokenPromisesCountDelta: 1,
  orderTrendState: "declining",
  disputeStatus: "closed",
  strategicFlag: false,
  creditLimit: 110000,
  paymentTermsDays: 30,
  accountManagerConfidence: 42,
};

const PRESETS: Record<string, ScenarioInputs> = {
  "Miss Another Payment": INITIAL_INPUTS,
  "Receive Partial Payment": {
    ...INITIAL_INPUTS,
    daysOverdueDelta: 3,
    outstandingBalanceDelta: 0,
    partialPaymentAmount: 8500,
    brokenPromisesCountDelta: 0,
    orderTrendState: "stable",
    accountManagerConfidence: 58,
  },
  "Dispute Reopens": {
    ...INITIAL_INPUTS,
    daysOverdueDelta: 5,
    outstandingBalanceDelta: 3200,
    disputeStatus: "open",
    accountManagerConfidence: 48,
  },
  "Customer Recovers": {
    ...INITIAL_INPUTS,
    daysOverdueDelta: -7,
    outstandingBalanceDelta: -8500,
    partialPaymentAmount: 12000,
    brokenPromisesCountDelta: 0,
    orderTrendState: "recovering",
    accountManagerConfidence: 71,
  },
};

function toApiInputs(inputs: ScenarioInputs) {
  return {
    days_overdue_delta: inputs.daysOverdueDelta,
    outstanding_balance_delta: inputs.outstandingBalanceDelta,
    partial_payment_amount: inputs.partialPaymentAmount,
    broken_promises_count_delta: inputs.brokenPromisesCountDelta,
    order_trend_state: inputs.orderTrendState,
    dispute_status: inputs.disputeStatus,
    strategic_flag: inputs.strategicFlag,
    credit_limit: inputs.creditLimit,
    payment_terms_days: inputs.paymentTermsDays,
    account_manager_confidence: inputs.accountManagerConfidence,
  };
}

function fromApiInputs(inputs: ApiSimulationResponse["inputs"]): ScenarioInputs {
  return {
    daysOverdueDelta: inputs.days_overdue_delta,
    outstandingBalanceDelta: inputs.outstanding_balance_delta,
    partialPaymentAmount: inputs.partial_payment_amount,
    brokenPromisesCountDelta: inputs.broken_promises_count_delta,
    orderTrendState: inputs.order_trend_state,
    disputeStatus: inputs.dispute_status,
    strategicFlag: inputs.strategic_flag,
    creditLimit: inputs.credit_limit,
    paymentTermsDays: inputs.payment_terms_days,
    accountManagerConfidence: inputs.account_manager_confidence,
  };
}

function mapSimulationResponse(response: ApiSimulationResponse): ScenarioSnapshot {
  return {
    simulationId: response.simulation.simulation_id,
    name: response.simulation.scenario_name,
    inputs: fromApiInputs(response.inputs),
    result: {
      riskLevel: response.scenario_result.risk_level,
      riskScore: response.scenario_result.risk_score,
      action: response.scenario_result.recommended_action,
      approvalRequired: response.scenario_result.approval_required ? "Yes" : "No",
      topDrivers: response.scenario_result.top_drivers,
    },
    deltas: response.delta_report.top_changed_drivers,
    policyImpact: response.delta_report.policy_impact.newly_triggered_rules,
    traceReference: {
      simulationRunId: response.trace_reference.simulation_run_id,
      traceAvailable: response.trace_reference.trace_available,
    },
    modelUsed: response.simulation.model_used,
  };
}

function mapSavedScenario(item: ApiSimulationListResponse["saved_scenarios"][number]): SavedScenario {
  return {
    simulationId: item.simulation_id,
    name: item.scenario_name,
    risk: item.risk_level_after,
    approval: item.approval_required ? "Approval required" : "No approval",
  };
}

export default function SimulatorPage() {
  const [inputs, setInputs] = useState<ScenarioInputs>(INITIAL_INPUTS);
  const [scenarioName, setScenarioName] = useState("Miss Another Payment");
  const [result, setResult] = useState<SimulationResult>(simulationData.scenarioResult);
  const [deltas, setDeltas] = useState(simulationData.deltas);
  const [policyImpact, setPolicyImpact] = useState(simulationData.policyImpact);
  const [activeSimulationId, setActiveSimulationId] = useState("sim_301");
  const [traceReference, setTraceReference] = useState<TraceReference>({ simulationRunId: "run_sim_301", traceAvailable: true });
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([
    { simulationId: "sim_301", name: "Miss Another Payment", risk: "High", approval: "Approval required" },
      { simulationId: "sim_302", name: "Receive Partial Payment", risk: "Monitor", approval: "No approval" },
  ]);
  const [comparisonScenario, setComparisonScenario] = useState<ScenarioSnapshot | null>(null);
  const [snapshotCache, setSnapshotCache] = useState<Record<string, ScenarioSnapshot>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJson<ApiSimulationListResponse>(`/cases/${simulationData.caseId}/simulations`)
      .then((data) => {
        setSavedScenarios(data.saved_scenarios.map(mapSavedScenario));
      })
      .catch(() => undefined);
  }, []);

  const changedFieldCount = useMemo(() => {
    return Object.entries(inputs).filter(([key, value]) => {
      const initialValue = INITIAL_INPUTS[key as keyof ScenarioInputs];
      return initialValue !== value;
    }).length;
  }, [inputs]);

  async function runSimulation() {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetchJson<ApiSimulationResponse>(`/cases/${simulationData.caseId}/simulate`, {
        method: "POST",
        body: JSON.stringify({
          scenario_name: scenarioName,
          inputs: toApiInputs(inputs),
        }),
      });
      const snapshot = mapSimulationResponse(response);
      setResult(snapshot.result);
      setDeltas(snapshot.deltas);
      setPolicyImpact(snapshot.policyImpact);
      setFeedback(response.explanation.summary);
      setActiveSimulationId(snapshot.simulationId);
      setTraceReference(snapshot.traceReference);
      setModelUsed(snapshot.modelUsed);
      setScenarioName(snapshot.name);
      setSnapshotCache((current) => ({ ...current, [snapshot.simulationId]: snapshot }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to run simulation.");
    } finally {
      setLoading(false);
    }
  }

  async function saveScenario() {
    setLoading(true);
    try {
      const response = await fetchJson<any>(`/simulations/${activeSimulationId}/save`, { method: "POST" });
      setFeedback(response.message);
      setSnapshotCache((current) => ({
        ...current,
        [activeSimulationId]: {
          simulationId: activeSimulationId,
          name: scenarioName,
          inputs,
          result,
          deltas,
          policyImpact,
          traceReference,
          modelUsed,
        },
      }));
      setSavedScenarios((current) => {
        const next: SavedScenario = {
          simulationId: activeSimulationId.startsWith("sim_") ? activeSimulationId : `local-${Date.now()}`,
          name: scenarioName,
          risk: result.riskLevel,
          approval: result.approvalRequired === "Yes" ? "Approval required" : "No approval",
        };
        return [next, ...current.filter((item) => item.simulationId !== next.simulationId)];
      });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save scenario.");
    } finally {
      setLoading(false);
    }
  }

  async function loadScenario(simulationId: string) {
    setLoading(true);
    try {
      const response = await fetchJson<ApiSimulationResponse>(`/simulations/${simulationId}`);
      const snapshot = mapSimulationResponse(response);
      setActiveSimulationId(snapshot.simulationId);
      setScenarioName(snapshot.name);
      setInputs(snapshot.inputs);
      setResult(snapshot.result);
      setDeltas(snapshot.deltas);
      setPolicyImpact(snapshot.policyImpact);
      setTraceReference(snapshot.traceReference);
      setModelUsed(snapshot.modelUsed);
      setSnapshotCache((current) => ({ ...current, [snapshot.simulationId]: snapshot }));
      setFeedback(`Loaded saved scenario into the working form: ${snapshot.name}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to load saved scenario.");
    } finally {
      setLoading(false);
    }
  }

  async function compareScenario(simulationId: string) {
    setLoading(true);
    try {
      const cached = snapshotCache[simulationId];
      const snapshot = cached ?? mapSimulationResponse(await fetchJson<ApiSimulationResponse>(`/simulations/${simulationId}`));
      if (!cached) {
        setSnapshotCache((current) => ({ ...current, [snapshot.simulationId]: snapshot }));
      }
      setComparisonScenario(snapshot);
      setFeedback(`Comparing current working scenario against saved scenario: ${snapshot.name}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to compare saved scenario.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteScenario(simulationId: string) {
    setLoading(true);
    try {
      if (!simulationId.startsWith("local-")) {
        await fetchJson<any>(`/simulations/${simulationId}`, { method: "DELETE" });
      }
      setSavedScenarios((current) => current.filter((item) => item.simulationId !== simulationId));
      setSnapshotCache((current) => {
        const next = { ...current };
        delete next[simulationId];
        return next;
      });
      setComparisonScenario((current) => (current?.simulationId === simulationId ? null : current));
      setFeedback("Saved scenario removed.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to delete scenario.");
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(preset: string) {
    const next = PRESETS[preset];
    if (!next) return;
    setInputs(next);
    setScenarioName(preset);
    setFeedback(`Preset applied: ${preset}`);
  }

  function resetScenario() {
    setInputs(INITIAL_INPUTS);
    setScenarioName("Miss Another Payment");
    setComparisonScenario(null);
    setFeedback("Scenario reset to baseline demo inputs.");
  }

  function updateInput<K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) {
    setInputs((current) => ({ ...current, [key]: value }));
    setScenarioName((current) => (PRESETS[current] ? "Custom Scenario" : current));
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 style={{ margin: 0 }}>What-If Simulator</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>
            Edit the customer profile and stress signals below, then rerun the case to see how the recommendation,
            risk band, and approval requirement change.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/cases/${simulationData.caseId}`} style={secondaryLinkStyle}>
            Open Case
          </Link>
          <button style={secondaryButtonStyle} onClick={resetScenario} disabled={loading}>
            Reset Scenario
          </button>
          <button style={primaryButtonStyle} onClick={() => void runSimulation()} disabled={loading}>
            Run Simulation
          </button>
        </div>
      </section>

      {feedback ? <div style={feedbackStyle}>{feedback}</div> : null}

      <section style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 20 }}>
        <section style={panelStyle}>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Current customer</div>
          <div style={{ marginTop: 6, fontSize: 28, fontWeight: 700 }}>{simulationData.customerName}</div>
          <div style={{ marginTop: 10, color: "var(--text-muted)" }}>
            {changedFieldCount} scenario field{changedFieldCount === 1 ? "" : "s"} differ from the default demo setup.
          </div>
          <label style={{ ...fieldLabelStyle, marginTop: 16 }}>
            <div style={fieldTitleStyle}>Working scenario name</div>
            <div style={fieldHintStyle}>This name is used when you save or reload the current scenario.</div>
            <input
              type="text"
              value={scenarioName}
              onChange={(event) => setScenarioName(event.target.value || "Custom Scenario")}
              style={inputStyle}
            />
          </label>
        </section>
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Quick Presets</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(PRESETS).map((preset) => (
              <button key={preset} style={secondaryButtonStyle} onClick={() => applyPreset(preset)} disabled={loading}>
                {preset}
              </button>
            ))}
          </div>
        </section>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr 0.8fr", gap: 20 }}>
        <section style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Customer Profile</h2>
            <div style={controlGridStyle}>
              <LabeledToggle
                label="Strategic account"
                hint="Marks the account as commercially sensitive."
                checked={inputs.strategicFlag}
                onChange={(value) => updateInput("strategicFlag", value)}
              />
              <LabeledSelect
                label="Payment terms"
                hint="Trade credit terms for this account."
                value={String(inputs.paymentTermsDays)}
                options={[
                  ["21", "Net 21"],
                  ["30", "Net 30"],
                  ["45", "Net 45"],
                ]}
                onChange={(value) => updateInput("paymentTermsDays", Number(value))}
              />
              <LabeledNumber
                label="Credit limit"
                hint="Approved trade-credit ceiling."
                value={inputs.creditLimit}
                step={5000}
                onChange={(value) => updateInput("creditLimit", value)}
              />
              <LabeledRange
                label="Account manager confidence"
                hint="Qualitative confidence in recoverability."
                min={0}
                max={100}
                value={inputs.accountManagerConfidence}
                onChange={(value) => updateInput("accountManagerConfidence", value)}
              />
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Payment Stress</h2>
            <div style={controlGridStyle}>
              <LabeledNumber
                label="Days overdue delta"
                hint="How many days later the account becomes versus baseline."
                value={inputs.daysOverdueDelta}
                step={1}
                onChange={(value) => updateInput("daysOverdueDelta", value)}
              />
              <LabeledNumber
                label="Outstanding balance delta"
                hint="Change in unpaid amount compared with baseline."
                value={inputs.outstandingBalanceDelta}
                step={500}
                onChange={(value) => updateInput("outstandingBalanceDelta", value)}
              />
              <LabeledNumber
                label="Partial payment amount"
                hint="New partial payment received in this scenario."
                value={inputs.partialPaymentAmount}
                step={500}
                onChange={(value) => updateInput("partialPaymentAmount", value)}
              />
              <LabeledNumber
                label="Broken promises delta"
                hint="Additional missed promise-to-pay events."
                value={inputs.brokenPromisesCountDelta}
                step={1}
                onChange={(value) => updateInput("brokenPromisesCountDelta", value)}
              />
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Relationship And Operations</h2>
            <div style={controlGridStyle}>
              <LabeledSelect
                label="Order trend"
                hint="Commercial demand direction."
                value={inputs.orderTrendState}
                options={[
                  ["recovering", "Recovering"],
                  ["stable", "Stable"],
                  ["declining", "Declining"],
                  ["sharply_declining", "Sharply declining"],
                ]}
                onChange={(value) => updateInput("orderTrendState", value as OrderTrendState)}
              />
              <LabeledSelect
                label="Dispute status"
                hint="Whether an operational dispute is affecting payment behavior."
                value={inputs.disputeStatus}
                options={[
                  ["none", "None"],
                  ["open", "Open"],
                  ["closed", "Closed"],
                ]}
                onChange={(value) => updateInput("disputeStatus", value as DisputeStatus)}
              />
            </div>
          </section>
        </section>

        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Before vs After</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={comparisonCardStyle}>
              <div style={smallLabelStyle}>Baseline</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>{simulationData.baseline.riskLevel}</div>
              <div style={{ color: "var(--text-muted)", marginTop: 6 }}>Risk score {simulationData.baseline.riskScore}</div>
              <div style={{ marginTop: 10, fontWeight: 700 }}>{simulationData.baseline.action}</div>
              <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                Approval required: {simulationData.baseline.approvalRequired}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {simulationData.baseline.topDrivers.map((driver) => (
                  <span key={driver} style={miniChipStyle}>
                    {driver}
                  </span>
                ))}
              </div>
            </div>
            <div style={comparisonCardStyle}>
              <div style={smallLabelStyle}>Scenario Result</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>{result.riskLevel}</div>
              <div style={{ color: "var(--text-muted)", marginTop: 6 }}>Risk score {result.riskScore}</div>
              <div style={{ marginTop: 10, fontWeight: 700 }}>{result.action}</div>
              <div style={{ color: "var(--text-muted)", marginTop: 6 }}>Approval required: {result.approvalRequired}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {result.topDrivers.map((driver) => (
                  <span key={driver} style={softChipStyle}>
                    {driver}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Top changed drivers</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {deltas.map((item) => (
                  <span key={item} style={softChipStyle}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Policy impact</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
                {policyImpact.map((item) => (
                  <li key={item} style={{ marginBottom: 6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {comparisonScenario ? (
            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Saved Scenario Comparison</div>
                  <div style={{ color: "var(--text-muted)", marginTop: 4 }}>
                    Comparing the working scenario against `{comparisonScenario.name}`.
                  </div>
                </div>
                <button style={secondaryButtonStyle} onClick={() => setComparisonScenario(null)} disabled={loading}>
                  Clear Compare
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={comparisonCardStyle}>
                  <div style={smallLabelStyle}>Working Scenario</div>
                  <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>{scenarioName}</div>
                  <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                    {result.riskLevel} | Score {result.riskScore} | Approval {result.approvalRequired}
                  </div>
                  <div style={{ marginTop: 10, fontWeight: 700 }}>{result.action}</div>
                </div>
                <div style={comparisonCardStyle}>
                  <div style={smallLabelStyle}>Saved Scenario</div>
                  <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>{comparisonScenario.name}</div>
                  <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                    {comparisonScenario.result.riskLevel} | Score {comparisonScenario.result.riskScore} | Approval{" "}
                    {comparisonScenario.result.approvalRequired}
                  </div>
                  <div style={{ marginTop: 10, fontWeight: 700 }}>{comparisonScenario.result.action}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Working drivers</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {result.topDrivers.map((driver) => (
                      <span key={driver} style={softChipStyle}>
                        {driver}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Saved scenario drivers</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {comparisonScenario.result.topDrivers.map((driver) => (
                      <span key={driver} style={miniChipStyle}>
                        {driver}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>How To Use This</h2>
            <ol style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
              <li style={{ marginBottom: 6 }}>Edit the customer profile and stress fields on the left.</li>
              <li style={{ marginBottom: 6 }}>Click `Run Simulation` to recompute the recommendation.</li>
              <li style={{ marginBottom: 6 }}>Compare the new risk, action, and approval state in the center panel.</li>
            </ol>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>AI Explanation</h2>
            <p style={{ marginTop: 0, color: "var(--text-muted)" }}>
              The simulator reruns the case logic using your updated profile and payment inputs. That lets the user see
              whether the account stays in monitored recovery or tips into escalation.
            </p>
            <div style={{ color: "var(--text-muted)", marginBottom: 10 }}>
              Working scenario: {scenarioName} | Active simulation: {activeSimulationId}
              {modelUsed ? ` | Model: ${modelUsed}` : ""}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href={traceReference.traceAvailable ? `/traces?runId=${traceReference.simulationRunId}&caseId=${simulationData.caseId}` : `/traces?caseId=${simulationData.caseId}`}
                style={secondaryLinkStyle}
              >
                Open Simulation Trace
              </Link>
              <button style={secondaryButtonStyle} onClick={() => void saveScenario()} disabled={loading}>
                Save Scenario
              </button>
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Saved Scenarios</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {savedScenarios.map((scenario) => (
                <div key={scenario.simulationId} style={savedScenarioRowStyle}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{scenario.name}</div>
                    <div style={{ color: "var(--text-muted)", marginTop: 4 }}>
                      {scenario.risk} | {scenario.approval}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {!scenario.simulationId.startsWith("local-") ? (
                      <>
                        <button
                          style={secondaryButtonStyle}
                          onClick={() => void compareScenario(scenario.simulationId)}
                          disabled={loading}
                        >
                          Compare
                        </button>
                        <button
                          style={secondaryButtonStyle}
                          onClick={() => void loadScenario(scenario.simulationId)}
                          disabled={loading}
                        >
                          Load
                        </button>
                      </>
                    ) : null}
                    <button
                      style={inlineDangerButtonStyle}
                      onClick={() => void deleteScenario(scenario.simulationId)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </section>
    </div>
  );
}

function LabeledNumber(props: {
  label: string;
  hint: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={fieldLabelStyle}>
      <div style={fieldTitleStyle}>{props.label}</div>
      <div style={fieldHintStyle}>{props.hint}</div>
      <input
        type="number"
        value={props.value}
        step={props.step}
        onChange={(event) => props.onChange(Number(event.target.value))}
        style={inputStyle}
      />
    </label>
  );
}

function LabeledSelect(props: {
  label: string;
  hint: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <label style={fieldLabelStyle}>
      <div style={fieldTitleStyle}>{props.label}</div>
      <div style={fieldHintStyle}>{props.hint}</div>
      <select value={props.value} onChange={(event) => props.onChange(event.target.value)} style={inputStyle}>
        {props.options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LabeledToggle(props: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label style={fieldLabelStyle}>
      <div style={fieldTitleStyle}>{props.label}</div>
      <div style={fieldHintStyle}>{props.hint}</div>
      <div style={toggleRowStyle}>
        <input type="checkbox" checked={props.checked} onChange={(event) => props.onChange(event.target.checked)} />
        <span>{props.checked ? "Enabled" : "Disabled"}</span>
      </div>
    </label>
  );
}

function LabeledRange(props: {
  label: string;
  hint: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={fieldLabelStyle}>
      <div style={fieldTitleStyle}>{props.label}</div>
      <div style={fieldHintStyle}>{props.hint}</div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(event) => props.onChange(Number(event.target.value))}
      />
      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{props.value}</div>
    </label>
  );
}

const panelStyle: CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 20,
};

const comparisonCardStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
  background: "var(--panel-muted)",
};

const controlGridStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const fieldLabelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  padding: 14,
  border: "1px solid var(--border)",
  borderRadius: 14,
  background: "var(--panel-muted)",
};

const fieldTitleStyle: CSSProperties = {
  fontWeight: 700,
};

const fieldHintStyle: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: 13,
};

const inputStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--panel)",
  color: "var(--text)",
};

const toggleRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const smallLabelStyle: CSSProperties = {
  color: "var(--text-muted)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1,
};

const panelTitleStyle: CSSProperties = { marginTop: 0, marginBottom: 14, fontSize: 20 };

const miniChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--panel)",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
  fontSize: 12,
  fontWeight: 700,
};

const softChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 600,
  fontSize: 12,
};

const primaryButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid var(--accent)",
  background: "var(--accent)",
  color: "white",
  fontWeight: 600,
};

const secondaryButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--panel)",
  color: "var(--text)",
  fontWeight: 600,
};

const secondaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--panel)",
  color: "var(--text)",
  fontWeight: 600,
};

const inlineDangerButtonStyle: CSSProperties = {
  background: "transparent",
  border: "1px solid #d8b4ad",
  color: "#8b3a2f",
  borderRadius: 10,
  padding: "8px 10px",
  fontWeight: 600,
};

const savedScenarioRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  borderBottom: "1px solid var(--border)",
  paddingBottom: 10,
};

const feedbackStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--accent)",
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 600,
};
