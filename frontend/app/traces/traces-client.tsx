"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";

import { fetchJson } from "../lib/api";
import { traceData } from "../lib/demo-data";

type RunDetail = {
  run: {
    run_id: string;
    case_id: string;
    customer_id: string;
    customer_name: string;
    status: string;
    started_at: string;
    ended_at: string;
    duration_ms: number;
    estimated_cost_usd: number;
    approval_interrupt_occurred: boolean;
  };
  workflow_nodes: Array<{
    node_id: string;
    label: string;
    status: string;
    duration_ms: number;
    model: string | null;
    summary: string;
  }>;
  tool_calls: Array<{
    tool_call_id: string;
    node_id: string;
    mcp_server: string;
    tool_name: string;
    status: string;
    latency_ms: number;
    input_summary: string;
    output_summary: string;
  }>;
  structured_outputs: Array<{
    node_id: string;
    title: string;
    payload: Record<string, string | number | boolean | string[]>;
  }>;
  model_routing: Array<{
    node_id: string;
    model: string;
    provider: string;
    route_reason: string;
    fallback_used: boolean;
  }>;
  events: Array<{
    event_type: string;
    timestamp: string;
    node_id?: string | null;
    summary: string;
  }>;
};

type RunHistoryResponse = {
  case_id: string;
  runs: Array<{
    run_id: string;
    case_id: string;
    customer_name: string;
    status: string;
    started_at: string;
    duration_ms: number;
    model_used: string | null;
  }>;
};

export function TracesClient() {
  const searchParams = useSearchParams();
  const requestedCaseId = searchParams.get("caseId") ?? "case_012";
  const requestedRunId = searchParams.get("runId");

  const [trace, setTrace] = useState<RunDetail | null>(null);
  const [comparison, setComparison] = useState<string[] | null>(null);
  const [history, setHistory] = useState<RunHistoryResponse["runs"]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [traceSource, setTraceSource] = useState<"live" | "demo">("demo");

  useEffect(() => {
    let cancelled = false;

    async function loadTrace() {
      setLoading(true);
      try {
        let response: RunDetail;
        if (requestedRunId) {
          try {
            response = await fetchJson<RunDetail>(`/runs/${requestedRunId}`);
          } catch {
            response = await fetchJson<RunDetail>(`/runs/by-case/${requestedCaseId}`);
          }
        } else {
          response = await fetchJson<RunDetail>(`/runs/by-case/${requestedCaseId}`);
        }

        if (cancelled) return;
        setTrace(response);
        setTraceSource("live");
        setFeedback(null);

        try {
          const historyResponse = await fetchJson<RunHistoryResponse>(`/runs/history/${response.run.case_id}`);
          if (!cancelled) {
            setHistory(historyResponse.runs);
          }
        } catch {
          if (!cancelled) {
            setHistory([]);
          }
        }
      } catch {
        if (cancelled) return;
        setTrace(null);
        setHistory([]);
        setTraceSource("demo");
        setFeedback("Showing demo trace because a live trace was not available for this selection.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTrace();
    return () => {
      cancelled = true;
    };
  }, [requestedCaseId, requestedRunId]);

  const activeRunId = trace?.run.run_id ?? traceData.runId;
  const activeCaseId = trace?.run.case_id ?? requestedCaseId;

  const summaryCards = useMemo(() => {
    if (trace) {
      return [
        ["Run ID", trace.run.run_id],
        ["Customer", trace.run.customer_name],
        ["Status", startCase(trace.run.status)],
        ["Active Node", trace.workflow_nodes.at(-1)?.label ?? "Live Case Review"],
        ["Duration", `${(trace.run.duration_ms / 1000).toFixed(1)}s`],
        ["Estimated Cost", `$${trace.run.estimated_cost_usd.toFixed(4)}`],
      ];
    }

    return [
      ["Run ID", traceData.runId],
      ["Customer", traceData.customerName],
      ["Status", traceData.status],
      ["Active Node", traceData.activeNode],
      ["Duration", traceData.duration],
      ["Estimated Cost", traceData.cost],
    ];
  }, [trace]);

  async function handleCompare() {
    setLoading(true);
    try {
      const response = await fetchJson<{ differences: string[] }>(`/runs/${activeRunId}/compare`);
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
      const response = await fetchJson<{ message: string }>(`/runs/${activeRunId}/replay`, { method: "POST" });
      setFeedback(response.message);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to replay run.");
    } finally {
      setLoading(false);
    }
  }

  const nodes = trace
    ? trace.workflow_nodes.map((node) => ({
        nodeId: node.node_id,
        label: node.label,
        status: startCase(node.status),
        model: node.model,
        duration: `${(node.duration_ms / 1000).toFixed(1)}s`,
        summary: node.summary,
      }))
    : traceData.nodes;

  const routing = trace
    ? trace.model_routing.map((entry) => [entry.node_id, entry.model, entry.route_reason] as const)
    : traceData.modelRouting;

  const events = trace
    ? trace.events.map((event) => `${event.timestamp} | ${event.summary}`)
    : traceData.events;

  const toolCalls = trace
    ? trace.tool_calls.map((toolCall) => ({
        toolCallId: toolCall.tool_call_id,
        nodeId: toolCall.node_id,
        mcpServer: toolCall.mcp_server,
        toolName: toolCall.tool_name,
        latency: `${toolCall.latency_ms} ms`,
        input: toolCall.input_summary,
        output: toolCall.output_summary,
      }))
    : traceData.toolCalls;

  const structuredOutputs = trace
    ? trace.structured_outputs.map((output) => ({
        title: output.title,
        payload: output.payload,
      }))
    : traceData.structuredOutputs;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 style={{ margin: 0 }}>AI Workflow Trace</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>
            Technical console for live case-review workflow, current trace context, structured outputs, and future MCP
            visibility.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <span style={traceSource === "live" ? liveChipStyle : chipStyle}>
              {traceSource === "live" ? "Live LangSmith Trace" : "Demo Trace"}
            </span>
            <span style={miniChipStyle}>Case {activeCaseId}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/cases/${activeCaseId}`} style={secondaryLinkStyle}>
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
        {summaryCards.map(([label, value]) => (
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
            {nodes.map((node) => (
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
                  {node.model ?? "No model call"} | {node.duration}
                </div>
                <div style={{ marginTop: 10 }}>{node.summary}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Recent Runs</h2>
            {history.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {history.map((run) => (
                  <Link key={run.run_id} href={`/traces?runId=${run.run_id}`} style={historyRowStyle}>
                    <div style={{ fontWeight: 700 }}>{run.run_id.slice(0, 8)}</div>
                    <div style={{ color: "var(--text-muted)" }}>
                      {startCase(run.status)} | {(run.duration_ms / 1000).toFixed(1)}s | {run.model_used ?? "Unknown model"}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--text-muted)" }}>Recent live run history is not available for this case yet.</div>
            )}
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Model Routing</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {routing.map(([agent, model, reason]) => (
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
              {events.map((event) => (
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
            {toolCalls.map((toolCall) => (
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
            {structuredOutputs.map((output) => (
              <div key={output.title} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>{output.title}</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {Object.entries(output.payload).map(([key, value]) => (
                    <div key={key} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
                      <div style={{ color: "var(--text-muted)" }}>{key}</div>
                      <div>{Array.isArray(value) ? value.join(", ") : String(value)}</div>
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

function startCase(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
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

const historyRowStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  padding: 12,
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--panel-muted)",
  color: "var(--text)",
};
