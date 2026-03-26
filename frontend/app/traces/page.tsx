"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";

import { fetchJson } from "../lib/api";
import { traceData } from "../lib/demo-data";

export default function TracesPage() {
  const [comparison, setComparison] = useState<string[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCompare() {
    setLoading(true);
    try {
      const response = await fetchJson<any>(`/runs/${traceData.runId}/compare`);
      setComparison(response.differences);
      setFeedback(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to compare run.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReplay() {
    setLoading(true);
    try {
      const response = await fetchJson<any>(`/runs/${traceData.runId}/replay`, { method: "POST" });
      setFeedback(response.message);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to replay run.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 style={{ margin: 0 }}>AI Workflow Trace</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>
            Technical console for live case-review workflow, MCP tool calls, structured outputs, and model routing.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/cases/case_007" style={secondaryLinkStyle}>
            Open Case
          </Link>
          <button style={secondaryButtonStyle} onClick={() => void handleReplay()} disabled={loading}>
            Replay Run
          </button>
          <button style={primaryButtonStyle} onClick={() => void handleCompare()} disabled={loading}>
            Compare Baseline
          </button>
        </div>
      </section>

      {feedback ? <div style={feedbackStyle}>{feedback}</div> : null}
      {comparison ? (
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Baseline Comparison</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
            {comparison.map((item) => (
              <li key={item} style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12 }}>
        {[
          ["Run ID", traceData.runId],
          ["Customer", traceData.customerName],
          ["Status", traceData.status],
          ["Active Node", traceData.activeNode],
          ["Duration", traceData.duration],
          ["Estimated Cost", traceData.cost],
        ].map(([label, value]) => (
          <div key={label} style={panelStyle}>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Workflow Graph</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {traceData.nodes.map((node) => (
              <div
                key={node.nodeId}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 16,
                  background: node.status === "Running" ? "var(--accent-soft)" : "var(--panel-muted)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>{node.label}</div>
                  <span style={node.status === "Running" ? liveChipStyle : chipStyle}>{node.status}</span>
                </div>
                <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                  {node.model} | {node.duration}
                </div>
                <div style={{ marginTop: 10 }}>{node.summary}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Model Routing</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {traceData.modelRouting.map(([agent, model, reason]) => (
                <div key={agent} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                  <div style={{ fontWeight: 700 }}>{agent}</div>
                  <div style={{ color: "var(--text-muted)", marginTop: 4 }}>
                    {model} | {reason}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Run Events</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
              {traceData.events.map((event) => (
                <li key={event} style={{ marginBottom: 8 }}>
                  {event}
                </li>
              ))}
            </ul>
          </section>
        </section>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>MCP Tool Calls</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {traceData.toolCalls.map((toolCall) => (
              <div key={toolCall.toolCallId} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>{toolCall.toolName}</div>
                  <span style={miniChipStyle}>{toolCall.mcpServer}</span>
                </div>
                <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                  {toolCall.nodeId} | {toolCall.latency}
                </div>
                <div style={{ marginTop: 8 }}>
                  <strong>Input:</strong> {toolCall.input}
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Output:</strong> {toolCall.output}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Structured Outputs</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {traceData.structuredOutputs.map((output) => (
              <div key={output.title} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>{output.title}</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {Object.entries(output.payload).map(([key, value]) => (
                    <div key={key} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
                      <div style={{ color: "var(--text-muted)" }}>{key}</div>
                      <div>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

const panelStyle: CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 20,
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

const liveChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--accent)",
  color: "white",
  fontSize: 12,
  fontWeight: 700,
};

const miniChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--accent-soft)",
  color: "var(--accent)",
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

const feedbackStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--accent)",
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 600,
};
