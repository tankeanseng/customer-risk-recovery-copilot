"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { fetchJson } from "../lib/api";

type EvalSummaryResponse = {
  summary: {
    tool_selection_accuracy: number | null;
    recommendation_pass_rate: number;
    policy_compliance_rate: number;
    schema_validity_rate: number;
    approval_routing_correctness: number | null;
    average_run_latency_ms: number | null;
  };
  latest_eval_run: {
    eval_run_id: string;
    started_at: string;
    completed_at: string;
    scenario_count: number;
    models_evaluated: string[];
    repeat_count: number;
    execution_mode: string;
  };
  version_comparison: {
    baseline_version: string;
    optimized_version: string;
    baseline_score: number;
    optimized_score: number;
    comparison_note: string;
  };
  notes: string[];
};

type EvalScenariosResponse = {
  rows: Array<{
    scenario_id: string;
    case_id: string;
    label: string;
    customer_name: string;
    expected_action_band: string;
    actual_action: string;
    tool_selection_correct: boolean | null;
    policy_compliant: boolean;
    approval_routing_correct: boolean | null;
    status: string;
    trace_run_id: string | null;
    model: string;
    pass_count: number;
    max_pass_count: number;
    risk_band: string;
  }>;
};

type EvalRunDetailResponse = {
  eval_run_id: string;
  summary: EvalSummaryResponse["summary"];
  latest_eval_run: EvalSummaryResponse["latest_eval_run"];
  failures: Array<{
    scenario_id: string;
    label: string;
    customer_name: string;
    expected_action_band: string;
    actual_action: string;
    risk_band: string;
    likely_cause: string;
    trace_run_id: string | null;
  }>;
  models: string[];
  notes: string[];
};

export default function EvaluationPage() {
  const [summary, setSummary] = useState<EvalSummaryResponse | null>(null);
  const [scenarios, setScenarios] = useState<EvalScenariosResponse["rows"]>([]);
  const [detail, setDetail] = useState<EvalRunDetailResponse | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEvaluation() {
      setLoading(true);
      try {
        const [summaryResponse, scenariosResponse] = await Promise.all([
          fetchJson<EvalSummaryResponse>("/evals/summary"),
          fetchJson<EvalScenariosResponse>("/evals/scenarios"),
        ]);
        const detailResponse = await fetchJson<EvalRunDetailResponse>(`/evals/runs/${summaryResponse.latest_eval_run.eval_run_id}`);

        if (cancelled) return;
        setSummary(summaryResponse);
        setScenarios(scenariosResponse.rows);
        setDetail(detailResponse);
        setSelectedScenarioId(scenariosResponse.rows[0]?.scenario_id ?? null);
        setFeedback(null);
      } catch (error) {
        if (cancelled) return;
        setFeedback(error instanceof Error ? error.message : "Unable to load evaluation results.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvaluation();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refreshSnapshot() {
    setLoading(true);
    try {
      const response = await fetchJson<{ message: string }>("/evals/run", { method: "POST" });
      setFeedback(response.message);
      const [summaryResponse, scenariosResponse] = await Promise.all([
        fetchJson<EvalSummaryResponse>("/evals/summary"),
        fetchJson<EvalScenariosResponse>("/evals/scenarios"),
      ]);
      const detailResponse = await fetchJson<EvalRunDetailResponse>(`/evals/runs/${summaryResponse.latest_eval_run.eval_run_id}`);
      setSummary(summaryResponse);
      setScenarios(scenariosResponse.rows);
      setDetail(detailResponse);
      setSelectedScenarioId(scenariosResponse.rows[0]?.scenario_id ?? null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to refresh evaluation snapshot.");
    } finally {
      setLoading(false);
    }
  }

  const selectedScenario = useMemo(
    () => scenarios.find((row) => row.scenario_id === selectedScenarioId) ?? scenarios[0] ?? null,
    [scenarios, selectedScenarioId],
  );

  const selectedFailure =
    detail?.failures.find((failure) => failure.scenario_id === selectedScenario?.scenario_id) ?? detail?.failures[0] ?? null;

  const kpis = summary
    ? [
        ["Tool Selection Accuracy", formatPercent(summary.summary.tool_selection_accuracy)],
        ["Recommendation Pass Rate", formatPercent(summary.summary.recommendation_pass_rate)],
        ["Policy Compliance", formatPercent(summary.summary.policy_compliance_rate)],
        ["Schema Validity", formatPercent(summary.summary.schema_validity_rate)],
        ["Approval Routing", formatPercent(summary.summary.approval_routing_correctness)],
        ["Average Latency", formatLatency(summary.summary.average_run_latency_ms)],
      ]
    : [];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 style={{ margin: 0 }}>Evaluation</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>
            Measured quality dashboard for recommendation correctness, policy compliance, and regression safety.
          </p>
          {summary ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <span style={chipStyle}>Latest run: {summary.latest_eval_run.eval_run_id}</span>
              <span style={chipStyle}>Models: {summary.latest_eval_run.models_evaluated.length}</span>
              <span style={chipStyle}>Scenarios: {summary.latest_eval_run.scenario_count}</span>
              <span style={chipStyle}>Repeats: {summary.latest_eval_run.repeat_count}</span>
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/optimization" style={secondaryLinkStyle}>
            Open Optimization
          </Link>
          <button style={primaryButtonStyle} onClick={() => void refreshSnapshot()} disabled={loading}>
            Run Evaluation Suite
          </button>
        </div>
      </section>

      {feedback ? <div style={feedbackStyle}>{feedback}</div> : null}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12 }}>
        {kpis.map(([label, value]) => (
          <div key={label} style={panelStyle}>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        <section style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <h2 style={panelTitleStyle}>Scenario Table</h2>
            <div style={{ color: "var(--text-muted)" }}>{scenarios.length} scenario rows</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr>
                  {["Scenario", "Customer", "Expected Band", "Actual Action", "Risk Band", "Checks", "Status", "Trace"].map((header) => (
                    <th key={header} style={headerCellStyle}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenarios.map((row) => (
                  <tr
                    key={row.scenario_id}
                    onClick={() => setSelectedScenarioId(row.scenario_id)}
                    style={{
                      cursor: "pointer",
                      background: row.scenario_id === selectedScenario?.scenario_id ? "var(--accent-soft)" : "transparent",
                    }}
                  >
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 700 }}>{row.label}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{row.scenario_id}</div>
                    </td>
                    <td style={cellStyle}>{row.customer_name}</td>
                    <td style={cellStyle}>{row.expected_action_band}</td>
                    <td style={cellStyle}>{row.actual_action}</td>
                    <td style={cellStyle}>{row.risk_band}</td>
                    <td style={cellStyle}>
                      {row.pass_count}/{row.max_pass_count}
                    </td>
                    <td style={cellStyle}>
                      <span style={row.status === "pass" ? passChipStyle : failChipStyle}>{row.status}</span>
                    </td>
                    <td style={cellStyle}>
                      {row.trace_run_id ? (
                        <Link href={`/traces?runId=${row.trace_run_id}`} style={textLinkStyle}>
                          Open Trace
                        </Link>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>Not linked yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Failure Analysis</h2>
            {selectedFailure ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontWeight: 700 }}>{selectedFailure.label}</div>
                <div style={{ color: "var(--text-muted)" }}>{selectedFailure.customer_name}</div>
                <div>
                  <strong>Expected band:</strong> {selectedFailure.expected_action_band}
                </div>
                <div>
                  <strong>Actual action:</strong> {selectedFailure.actual_action}
                </div>
                <div>
                  <strong>Risk band:</strong> {selectedFailure.risk_band}
                </div>
                <div>
                  <strong>Likely cause:</strong> {selectedFailure.likely_cause}
                </div>
                {selectedFailure.trace_run_id ? (
                  <Link href={`/traces?runId=${selectedFailure.trace_run_id}`} style={secondaryLinkStyle}>
                    Open Linked Trace
                  </Link>
                ) : null}
              </div>
            ) : (
              <div style={{ color: "var(--text-muted)" }}>
                No failures were recorded for the default model in the current saved evaluation artifact.
              </div>
            )}
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Evaluation Notes</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
              {(detail?.notes ?? summary?.notes ?? []).map((note) => (
                <li key={note} style={{ marginBottom: 8 }}>
                  {note}
                </li>
              ))}
            </ul>
          </section>
        </section>
      </section>

      {summary ? (
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Version Comparison</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 16 }}>
            <div style={mutedPanelStyle}>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Baseline</div>
              <div style={{ marginTop: 8, fontWeight: 700 }}>{summary.version_comparison.baseline_version}</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>
                {formatPercent(summary.version_comparison.baseline_score)}
              </div>
            </div>
            <div style={mutedPanelStyle}>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Recommended Default</div>
              <div style={{ marginTop: 8, fontWeight: 700 }}>{summary.version_comparison.optimized_version}</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>
                {formatPercent(summary.version_comparison.optimized_score)}
              </div>
            </div>
            <div style={mutedPanelStyle}>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Comparison Note</div>
              <div style={{ marginTop: 8 }}>{summary.version_comparison.comparison_note}</div>
              <div style={{ marginTop: 12, color: "var(--accent)", fontWeight: 700 }}>
                Delta:{" "}
                {formatPercent(summary.version_comparison.optimized_score - summary.version_comparison.baseline_score)}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function formatPercent(value: number | null) {
  if (value === null || value === undefined) return "Pending";
  return `${(value * 100).toFixed(1)}%`;
}

function formatLatency(value: number | null) {
  if (value === null || value === undefined) return "Pending";
  return `${value} ms`;
}

const panelStyle: CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 20,
};

const mutedPanelStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
  background: "var(--panel-muted)",
};

const panelTitleStyle: CSSProperties = { marginTop: 0, marginBottom: 14, fontSize: 20 };

const chipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--panel-muted)",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
  fontSize: 12,
  fontWeight: 700,
};

const passChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#e6f5ee",
  color: "#1d7a46",
  fontSize: 12,
  fontWeight: 700,
};

const failChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#fdecea",
  color: "#b33a2b",
  fontSize: 12,
  fontWeight: 700,
};

const primaryButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid var(--accent)",
  background: "var(--accent)",
  color: "white",
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

const textLinkStyle: CSSProperties = {
  color: "var(--accent)",
  fontWeight: 600,
};

const feedbackStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--accent)",
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 600,
};

const headerCellStyle: CSSProperties = {
  textAlign: "left",
  padding: "0 0 12px",
  borderBottom: "1px solid var(--border)",
  color: "var(--text-muted)",
  fontSize: 13,
  fontWeight: 700,
};

const cellStyle: CSSProperties = {
  padding: "14px 8px 14px 0",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "top",
};
