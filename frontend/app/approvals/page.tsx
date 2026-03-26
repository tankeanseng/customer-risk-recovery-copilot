"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { fetchJson } from "../lib/api";
import { approvalsData } from "../lib/demo-data";

export default function ApprovalsPage() {
  const [queue, setQueue] = useState(approvalsData.queue);
  const [selectedId, setSelectedId] = useState(approvalsData.selected.approvalId);
  const [selectedDetail, setSelectedDetail] = useState(approvalsData.selected);
  const [decisionComment, setDecisionComment] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchJson<any>("/approvals")
      .then((data) => {
        if (cancelled) return;
        setQueue(
          data.queue.map((row: any) => ({
            approvalId: row.approval_id,
            caseId: row.case_id,
            customerName: row.customer_name,
            requestedAction: row.requested_action,
            riskLevel: row.risk_level,
            priority: row.priority,
            policyReason: row.policy_reason,
            waiting: row.waiting_since,
            status: row.status,
          })),
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchJson<any>(`/approvals/${selectedId}`)
      .then((data) => {
        if (cancelled) return;
        setSelectedDetail({
          approvalId: data.approval_id,
          caseId: data.case_id,
          customerName: data.customer_name,
          requestedAction: data.requested_action,
          riskSummary: data.risk_summary,
          policyReason: data.policy_reason,
          evidence: [
            ["Outstanding balance", data.evidence_snapshot.outstanding_balance.toLocaleString()],
            ["Overdue balance", data.evidence_snapshot.overdue_balance.toLocaleString()],
            ["Oldest overdue", `${data.evidence_snapshot.oldest_overdue_days}d`],
          ],
          topDrivers: data.evidence_snapshot.top_risk_drivers,
          recommendation: data.latest_recommendation.recommended_action,
          tradeoff: data.latest_recommendation.business_tradeoff,
          auditHistory: data.audit_history.map((event: any) => event.summary),
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const summary = useMemo(() => {
    const pending = queue.filter((item) => item.status.toLowerCase() === "pending").length;
    const approved = queue.filter((item) => item.status.toLowerCase() === "approved").length;
    const rejected = queue.filter((item) => item.status.toLowerCase() === "rejected").length;
    const revised = queue.filter((item) => item.status.toLowerCase() === "revision_requested").length;
    return [
      ["Pending", String(pending)],
      ["Approved", String(approved)],
      ["Rejected", String(rejected)],
      ["Revision Requested", String(revised)],
    ];
  }, [queue]);

  async function applyDecision(action: "approve" | "reject" | "revise") {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetchJson<any>(`/approvals/${selectedId}/${action}`, {
        method: "POST",
        body: JSON.stringify({ comment: decisionComment }),
      });
      setFeedback(response.case_status === "approved" ? "Approval completed." : response.case_status.replace("_", " "));
      setQueue((current) =>
        current.map((item) =>
          item.approvalId === selectedId
            ? {
                ...item,
                status:
                  response.status === "revision_requested"
                    ? "Revision Requested"
                    : response.status.charAt(0).toUpperCase() + response.status.slice(1),
              }
            : item,
        ),
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to submit decision.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" }}>
        <div>
          <h1 style={{ margin: 0 }}>Approvals</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>
            Human decision queue for sensitive AI recommendations that require governance before action.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/cases/${selectedDetail.caseId}`} style={secondaryLinkStyle}>
            Open Case
          </Link>
          <Link href="/traces" style={secondaryLinkStyle}>
            View Trace
          </Link>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        {summary.map(([label, value]) => (
          <div key={label} style={panelStyle}>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</div>
            <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Approval Queue</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {queue.map((row) => (
              <div key={row.approvalId} style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>{row.customerName}</div>
                  <span style={row.riskLevel === "Critical" ? criticalChipStyle : chipStyle}>{row.riskLevel}</span>
                </div>
                <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                  {row.requestedAction} | {row.priority} priority | waiting {row.waiting}
                </div>
                <div style={{ marginTop: 8 }}>{row.policyReason}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <Link href={`/cases/${row.caseId}`} style={secondaryLinkStyle}>
                    Open Case
                  </Link>
                  <button style={secondaryButtonStyle} onClick={() => setSelectedId(row.approvalId)}>
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Approval Detail</h2>
            <div style={{ fontWeight: 700, fontSize: 22 }}>{selectedDetail.customerName}</div>
            <div style={{ color: "var(--text-muted)", marginTop: 6 }}>{selectedDetail.requestedAction}</div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Risk summary</div>
              <div style={{ color: "var(--text-muted)" }}>{selectedDetail.riskSummary}</div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Policy reason</div>
              <div style={{ color: "var(--text-muted)" }}>{selectedDetail.policyReason}</div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Evidence snapshot</div>
              <div style={{ display: "grid", gap: 8 }}>
                {selectedDetail.evidence.map(([label, value]) => (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
                    <div style={{ color: "var(--text-muted)" }}>{label}</div>
                    <div>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {selectedDetail.topDrivers.map((driver) => (
                  <span key={driver} style={miniChipStyle}>
                    {driver}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Manager Decision</h2>
            <div style={{ fontWeight: 700 }}>{selectedDetail.recommendation}</div>
            <div style={{ color: "var(--text-muted)", marginTop: 6 }}>{selectedDetail.tradeoff}</div>
            <textarea
              value={decisionComment}
              onChange={(event) => setDecisionComment(event.target.value)}
              placeholder="Add manager comment..."
              style={{
                marginTop: 14,
                width: "100%",
                minHeight: 120,
                padding: 12,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--panel-muted)",
                resize: "vertical",
              }}
            />
            {feedback ? <div style={{ marginTop: 10, color: "var(--accent)", fontWeight: 600 }}>{feedback}</div> : null}
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button style={approveButtonStyle} onClick={() => void applyDecision("approve")} disabled={loading}>
                Approve
              </button>
              <button style={rejectButtonStyle} onClick={() => void applyDecision("reject")} disabled={loading}>
                Reject
              </button>
              <button style={secondaryButtonStyle} onClick={() => void applyDecision("revise")} disabled={loading}>
                Request Revision
              </button>
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Decision Audit</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
              {selectedDetail.auditHistory.map((event) => (
                <li key={event} style={{ marginBottom: 8 }}>
                  {event}
                </li>
              ))}
            </ul>
          </section>
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

const criticalChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f8e4e2",
  color: "#9d3228",
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

const approveButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #2e7d5a",
  background: "#2e7d5a",
  color: "white",
  fontWeight: 600,
};

const rejectButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #9d3228",
  background: "#9d3228",
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
