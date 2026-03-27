"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { fetchJson } from "../lib/api";

type SummaryResponse = {
  summary: {
    target_task: string;
    optimization_framework: string;
    baseline_version: string;
    optimized_version: string;
    baseline_score: number;
    optimized_score: number;
    improvement_delta: number;
  };
  experiment_history: Array<{
    optimization_run_id: string;
    target_task: string;
    baseline_score: number;
    best_score: number;
    candidate_count: number;
    completed_at: string;
  }>;
  sample_comparison: {
    case_id: string;
    customer_name: string;
    baseline_output: {
      recommended_action: string;
      reasoning_summary: string;
    };
    optimized_output: {
      recommended_action: string;
      reasoning_summary: string;
    };
    explanation_of_gain: string;
  };
};

type RunDetail = {
  optimization_run_id: string;
  summary: SummaryResponse["summary"];
  candidate_count: number;
  best_score: number;
  completed_at: string;
  sample_comparison: SummaryResponse["sample_comparison"];
  notes: string[];
};

export default function OptimizationPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RunDetail | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const response = await fetchJson<SummaryResponse>("/optimization/summary");
        if (cancelled) return;
        setSummary(response);
        setSelectedRunId(response.experiment_history[0]?.optimization_run_id ?? null);
      } catch (error) {
        if (cancelled) return;
        setFeedback(error instanceof Error ? error.message : "Unable to load optimization summary.");
      }
    }

    void loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!selectedRunId) return;

    async function loadDetail() {
      try {
        const response = await fetchJson<RunDetail>(`/optimization/runs/${selectedRunId}`);
        if (cancelled) return;
        setDetail(response);
      } catch (error) {
        if (cancelled) return;
        setFeedback(error instanceof Error ? error.message : "Unable to load optimization run.");
      }
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedRunId]);

  const activeComparison = detail?.sample_comparison ?? summary?.sample_comparison ?? null;
  const scoreDelta = summary ? summary.summary.optimized_score - summary.summary.baseline_score : 0;

  const metrics = useMemo(() => {
    if (!summary || !detail) return [];
    return [
      ["Baseline Score", formatPercent(summary.summary.baseline_score)],
      ["Optimized Score", formatPercent(summary.summary.optimized_score)],
      ["Delta", formatPercent(scoreDelta)],
      ["Candidate Count", String(detail.candidate_count)],
      ["Best Run", detail.optimization_run_id],
      ["Completed", detail.completed_at],
    ];
  }, [summary, detail, scoreDelta]);

  if (!summary) {
    return <div style={{ color: "var(--text-muted)" }}>{feedback ?? "Loading optimization..."}</div>;
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 style={{ margin: 0 }}>Optimization</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>
            DSPy-driven improvement of recommendation quality using saved optimization snapshots and evaluation-backed comparisons.
          </p>
        </div>
        <Link href="/evaluation" style={secondaryLinkStyle}>
          View Evaluation Impact
        </Link>
      </section>

      {feedback ? <div style={feedbackStyle}>{feedback}</div> : null}

      <section style={summaryCardStyle}>
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Target task</div>
        <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700 }}>{summary.summary.target_task}</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
          <span style={chipStyle}>Framework: {summary.summary.optimization_framework}</span>
          <span style={chipStyle}>Baseline: {summary.summary.baseline_version}</span>
          <span style={chipStyle}>Optimized: {summary.summary.optimized_version}</span>
          <span style={chipStyle}>Baseline {formatPercent(summary.summary.baseline_score)}</span>
          <span style={chipStyle}>Optimized {formatPercent(summary.summary.optimized_score)}</span>
          <span style={successChipStyle}>Improvement {formatPercent(summary.summary.improvement_delta)}</span>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Baseline Vs Optimized</h2>
          {activeComparison ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={mutedPanelStyle}>
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Baseline output</div>
                  <div style={{ marginTop: 8, fontWeight: 700 }}>{activeComparison.baseline_output.recommended_action}</div>
                  <div style={{ marginTop: 10, color: "var(--text-muted)" }}>
                    {activeComparison.baseline_output.reasoning_summary}
                  </div>
                </div>
                <div style={mutedPanelStyle}>
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Optimized output</div>
                  <div style={{ marginTop: 8, fontWeight: 700 }}>{activeComparison.optimized_output.recommended_action}</div>
                  <div style={{ marginTop: 10, color: "var(--text-muted)" }}>
                    {activeComparison.optimized_output.reasoning_summary}
                  </div>
                </div>
              </div>
              <div style={mutedPanelStyle}>
                <div style={{ fontWeight: 700 }}>Why the optimized version is better</div>
                <div style={{ marginTop: 8, color: "var(--text-muted)" }}>{activeComparison.explanation_of_gain}</div>
              </div>
            </div>
          ) : null}
        </section>

        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Optimization Metrics</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {metrics.map(([label, value]) => (
              <div key={label} style={mutedPanelStyle}>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 20 }}>
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Experiment History</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  {["Run ID", "Task", "Baseline", "Best", "Candidates", "Completed"].map((header) => (
                    <th key={header} style={headerCellStyle}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.experiment_history.map((row) => (
                  <tr
                    key={row.optimization_run_id}
                    onClick={() => setSelectedRunId(row.optimization_run_id)}
                    style={{
                      cursor: "pointer",
                      background: row.optimization_run_id === selectedRunId ? "var(--accent-soft)" : "transparent",
                    }}
                  >
                    <td style={cellStyle}>{row.optimization_run_id}</td>
                    <td style={cellStyle}>{row.target_task}</td>
                    <td style={cellStyle}>{formatPercent(row.baseline_score)}</td>
                    <td style={cellStyle}>{formatPercent(row.best_score)}</td>
                    <td style={cellStyle}>{row.candidate_count}</td>
                    <td style={cellStyle}>{row.completed_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Sample Output Comparison</h2>
          {activeComparison ? (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ fontWeight: 700 }}>
                {activeComparison.customer_name} | {activeComparison.case_id}
              </div>
              <div style={mutedPanelStyle}>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Baseline</div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>{activeComparison.baseline_output.recommended_action}</div>
                <div style={{ marginTop: 10, color: "var(--text-muted)" }}>
                  {activeComparison.baseline_output.reasoning_summary}
                </div>
              </div>
              <div style={mutedPanelStyle}>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Optimized</div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>{activeComparison.optimized_output.recommended_action}</div>
                <div style={{ marginTop: 10, color: "var(--text-muted)" }}>
                  {activeComparison.optimized_output.reasoning_summary}
                </div>
              </div>
              {detail?.notes?.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
                  {detail.notes.map((note) => (
                    <li key={note} style={{ marginBottom: 8 }}>
                      {note}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
      </section>
    </div>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

const panelStyle: CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 20,
};

const summaryCardStyle: CSSProperties = {
  ...panelStyle,
  background: "linear-gradient(135deg, var(--panel) 0%, var(--panel-muted) 100%)",
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

const successChipStyle: CSSProperties = {
  ...chipStyle,
  background: "#e6f5ee",
  color: "#1d7a46",
  border: "1px solid #c8ead8",
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
