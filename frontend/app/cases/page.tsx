"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { fetchJson } from "../lib/api";
import { casesData } from "../lib/demo-data";

export default function CasesPage() {
  const [rows, setRows] = useState(casesData.rows);
  const [activityFeed, setActivityFeed] = useState(casesData.activityFeed);
  const [statusFilter, setStatusFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<any>("/cases")
      .then((data) => {
        setRows(
          data.rows.map((row: any) => ({
            caseId: row.case_id,
            customerName: row.customer_name,
            region: row.region,
            segment: row.segment,
            status: row.status.replaceAll("_", " ").replace(/\b\w/g, (ch: string) => ch.toUpperCase()),
            priority: row.priority.charAt(0).toUpperCase() + row.priority.slice(1),
            triggerReason: row.trigger_reason,
            latestRecommendation: row.latest_recommendation,
            approvalStatus: row.approval_status === "none" ? "None" : row.approval_status.replaceAll("_", " "),
            latestRunStatus: row.latest_run_status ?? "Not started",
            updatedAt: row.updated_at,
          })),
        );
        setActivityFeed(
          data.activity_feed.map((event: any) => ({
            eventId: event.event_id,
            caseId: event.case_id,
            customerName: event.customer_name,
            timestamp: event.timestamp,
            summary: event.summary,
          })),
        );
      })
      .catch(() => undefined);
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      const matchesQuery =
        query.trim().length === 0 ||
        row.customerName.toLowerCase().includes(query.toLowerCase()) ||
        row.caseId.toLowerCase().includes(query.toLowerCase()) ||
        row.segment.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [rows, statusFilter, query]);

  const summary = useMemo(() => {
    return [
      ["Total Cases", String(rows.length)],
      ["New", String(rows.filter((row) => row.status === "New").length)],
      ["In Review", String(rows.filter((row) => row.status === "In Review").length)],
      ["Awaiting Approval", String(rows.filter((row) => row.status === "Awaiting Approval").length)],
      ["Resolved", String(rows.filter((row) => row.status === "Resolved").length)],
      ["Rejected", String(rows.filter((row) => row.status === "Rejected").length)],
    ];
  }, [rows]);

  async function runReview(caseId: string) {
    setFeedback(null);
    try {
      const response = await fetchJson<any>(`/cases/${caseId}/runs`, { method: "POST" });
      setFeedback(response.message);
      setRows((current) =>
        current.map((row) =>
          row.caseId === caseId ? { ...row, status: "In Review", latestRunStatus: response.status } : row,
        ),
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to start case review.");
    }
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end" }}>
        <div>
          <h1 style={{ margin: 0 }}>Cases</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>
            Workflow-oriented queue for recovery cases across review, approval, and resolution states.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search case id or customer..."
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border)", minWidth: 260 }}
          />
          <button style={buttonStyle(false)} onClick={() => setStatusFilter("All")}>
            Reset
          </button>
        </div>
      </section>

      {feedback ? <div style={feedbackStyle}>{feedback}</div> : null}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12 }}>
        {summary.map(([label, value]) => (
          <div key={label} style={panelStyle}>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</div>
            <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </section>

      <section style={panelStyle}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["All", "New", "In Review", "Awaiting Approval", "Approved", "Rejected", "Resolved"].map((label) => (
            <button
              key={label}
              onClick={() => setStatusFilter(label)}
              style={label === statusFilter ? activeFilterPillStyle : filterPillStyle}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        <section style={panelStyle}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: 13 }}>
                  {[
                    "Case",
                    "Customer",
                    "Region",
                    "Segment",
                    "Status",
                    "Priority",
                    "Trigger",
                    "Recommendation",
                    "Approval",
                    "Run",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.caseId}>
                    <td style={cellStyle}>{row.caseId}</td>
                    <td style={cellStyle}>
                      <Link href={`/cases/${row.caseId}`} style={{ fontWeight: 700 }}>
                        {row.customerName}
                      </Link>
                    </td>
                    <td style={cellStyle}>{row.region}</td>
                    <td style={cellStyle}>{row.segment}</td>
                    <td style={cellStyle}>{row.status}</td>
                    <td style={cellStyle}>{row.priority}</td>
                    <td style={cellStyle}>{row.triggerReason}</td>
                    <td style={cellStyle}>{row.latestRecommendation}</td>
                    <td style={cellStyle}>{row.approvalStatus}</td>
                    <td style={cellStyle}>{row.latestRunStatus}</td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link href={`/cases/${row.caseId}`} style={inlineLinkStyle}>
                          Open
                        </Link>
                        <button style={inlineButtonStyle} onClick={() => void runReview(row.caseId)}>
                          Run Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Recent Activity</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {activityFeed.map((event) => (
              <div key={event.eventId} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>{event.customerName}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{event.timestamp}</div>
                <div style={{ marginTop: 6 }}>{event.summary}</div>
                <div style={{ marginTop: 8 }}>
                  <Link href={`/cases/${event.caseId}`} style={inlineLinkStyle}>
                    Open Case
                  </Link>
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

const filterPillStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "var(--panel-muted)",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
};

const activeFilterPillStyle: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "var(--accent-soft)",
  border: "1px solid var(--accent)",
  color: "var(--accent)",
};

const buttonStyle = (primary: boolean): CSSProperties => ({
  padding: "10px 14px",
  borderRadius: 12,
  border: primary ? "1px solid var(--accent)" : "1px solid var(--border)",
  background: primary ? "var(--accent)" : "var(--panel)",
  color: primary ? "white" : "var(--text)",
  fontWeight: 600,
});

const inlineButtonStyle: CSSProperties = {
  color: "var(--accent)",
  background: "transparent",
  border: "none",
  padding: 0,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const cellStyle: CSSProperties = {
  padding: "12px 8px",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "top",
};

const inlineLinkStyle: CSSProperties = {
  color: "var(--accent)",
  fontWeight: 600,
  fontSize: 14,
};

const panelTitleStyle: CSSProperties = { marginTop: 0, marginBottom: 14, fontSize: 20 };

const feedbackStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--accent)",
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 600,
};
