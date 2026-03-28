"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";

import { fetchJson } from "../../lib/api";

export function CaseActions(props: { caseId: string; onChanged?: () => void }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<any | null>(null);
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [traceAvailable, setTraceAvailable] = useState(false);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runReview() {
    setLoading(true);
    try {
      const response = await fetchJson<any>(`/cases/${props.caseId}/runs`, { method: "POST" });
      setFeedback(response.message);
      setReviewResult(response.recommendation ?? null);
      setLastRunId(response.run_id ?? null);
      setTraceAvailable(Boolean(response.trace_available));
      setApprovalId(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to run AI review.");
      setReviewResult(null);
      setLastRunId(null);
      setTraceAvailable(false);
      setApprovalId(null);
    } finally {
      setLoading(false);
      props.onChanged?.();
    }
  }

  async function submitApproval() {
    setLoading(true);
    try {
      const response = await fetchJson<any>(`/cases/${props.caseId}/approval-requests`, { method: "POST" });
      setFeedback(response.message);
      setApprovalId(response.approval_id ?? null);
      if (response.trace_run_id) {
        setLastRunId(response.trace_run_id);
        setTraceAvailable(Boolean(response.trace_available));
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to submit for approval.");
    } finally {
      setLoading(false);
      props.onChanged?.();
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={primaryButtonStyle} onClick={() => void runReview()} disabled={loading}>
          Run AI Review
        </button>
        <button style={secondaryButtonStyle} onClick={() => void runReview()} disabled={loading}>
          Rerun Review
        </button>
        <Link href="/simulator" style={secondaryLinkStyle}>
          Open Simulator
        </Link>
        <Link href={lastRunId ? `/traces?runId=${lastRunId}&caseId=${props.caseId}` : `/traces?caseId=${props.caseId}`} style={secondaryLinkStyle}>
          View Full Trace
        </Link>
        <button style={secondaryButtonStyle} onClick={() => void submitApproval()} disabled={loading}>
          Submit For Approval
        </button>
      </div>
      {feedback ? <div style={feedbackStyle}>{feedback}</div> : null}
      {approvalId ? (
        <div style={resultCardStyle}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>
            Approval Request Created
          </div>
          <div style={{ marginTop: 8, fontWeight: 700 }}>{approvalId}</div>
          <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
            The case is now in the manager approval queue. Open the exact approval item to continue the workflow.
          </div>
          <div style={{ marginTop: 10 }}>
            <Link href={`/approvals?approvalId=${approvalId}`} style={inlineTraceLinkStyle}>
              Open approval detail
            </Link>
          </div>
        </div>
      ) : null}
      {reviewResult ? (
        <div style={resultCardStyle}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>
            Live AI Result
          </div>
          <div style={{ marginTop: 8, fontWeight: 700 }}>{reviewResult.recommended_action}</div>
          <div style={{ marginTop: 6, color: "var(--text-muted)" }}>{reviewResult.risk_summary}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <span style={resultChipStyle}>{reviewResult.risk_band}</span>
            <span style={resultChipStyle}>Score {reviewResult.risk_score}</span>
            {traceAvailable && lastRunId ? <span style={resultChipStyle}>Trace {lastRunId.slice(0, 8)}</span> : null}
          </div>
          {traceAvailable && lastRunId ? (
            <div style={{ marginTop: 10 }}>
              <Link href={`/traces?runId=${lastRunId}&caseId=${props.caseId}`} style={inlineTraceLinkStyle}>
                Open exact live trace
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

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

const resultCardStyle: CSSProperties = {
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--panel-muted)",
};

const resultChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 700,
  fontSize: 12,
};

const inlineTraceLinkStyle: CSSProperties = {
  color: "var(--accent)",
  fontWeight: 700,
};
