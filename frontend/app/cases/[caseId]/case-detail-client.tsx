"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { fetchJson } from "../../lib/api";
import { CaseActions } from "./case-actions";

type CaseDetailData = {
  case_id: string;
  customer_name: string;
  segment: string;
  region: string;
  case_status: string;
  approval_status: string;
  latest_run_id: string | null;
  latest_run_status: string | null;
  latest_approval_id: string | null;
  relationship_duration: string;
  payment_terms: string;
  credit_limit: number;
  account_owner: string;
  strategic: string;
  tier: string;
  risk_band: string;
  risk_score: number;
  triage: {
    triage_score: number;
    risk_band: string;
    trigger_reasons: Array<{ label: string }>;
    latest_baseline_review_at: string;
    case_source: string;
  };
  case_brief: {
    customer_summary: string;
    risk_summary: string;
    recommended_action: string;
    why_now: string;
    policy_status: string;
    next_steps: string[];
  };
  risk_drivers: string[];
  notes: string[];
  policy_summary: string[];
};

function formatStatus(value: string | null | undefined) {
  if (!value) return "Unknown";
  return value
    .replaceAll("_", " ")
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

export function CaseDetailClient(props: { caseId: string; initialDetail: CaseDetailData }) {
  const [detail, setDetail] = useState<CaseDetailData>(props.initialDetail);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refreshDetail = useCallback(async () => {
    try {
      const next = await fetchJson<CaseDetailData>(`/cases/${props.caseId}`);
      setDetail(next);
      setFeedback(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to refresh case detail.");
    }
  }, [props.caseId]);

  useEffect(() => {
    void refreshDetail();
  }, [refreshDetail]);

  const meta = `${detail.segment} | ${detail.region} | ${detail.relationship_duration} | ${detail.payment_terms} | Credit Limit ${detail.credit_limit.toLocaleString()} | Owner: ${detail.account_owner}`;
  const badges = [
    `Strategic: ${detail.strategic}`,
    `Tier: ${detail.tier}`,
    `Case ${formatStatus(detail.case_status)}`,
    `Approval ${formatStatus(detail.approval_status)}`,
  ];
  const riskSnapshot = [
    { label: "Risk", value: detail.risk_band },
    { label: "Risk Score", value: String(detail.risk_score) },
    { label: "Triage Score", value: String(detail.triage.triage_score) },
    { label: "Case Status", value: formatStatus(detail.case_status) },
    { label: "Approval", value: formatStatus(detail.approval_status) },
    { label: "Latest Run", value: formatStatus(detail.latest_run_status) },
  ];

  const traceHref = detail.latest_run_id
    ? `/traces?runId=${detail.latest_run_id}&caseId=${detail.case_id}`
    : `/traces?caseId=${detail.case_id}`;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <Link href="/portfolio" style={secondaryLinkStyle}>
              Back to Portfolio
            </Link>
            <Link href="/cases" style={secondaryLinkStyle}>
              Open in Cases
            </Link>
            {detail.latest_approval_id ? (
              <Link href={`/approvals?approvalId=${detail.latest_approval_id}`} style={secondaryLinkStyle}>
                Open Approval
              </Link>
            ) : null}
          </div>
          <h1 style={{ margin: 0 }}>{detail.customer_name}</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>{meta}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {badges.map((badge) => (
              <span key={badge} style={softChipStyle}>
                {badge}
              </span>
            ))}
            {detail.latest_run_id ? <span style={miniChipStyle}>Run {detail.latest_run_id.slice(0, 12)}</span> : null}
          </div>
        </div>
        <CaseActions caseId={props.caseId} onChanged={() => void refreshDetail()} />
      </section>

      {feedback ? <div style={feedbackStyle}>{feedback}</div> : null}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12 }}>
        {riskSnapshot.map((item) => (
          <div key={item.label} style={panelStyle}>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{item.label}</div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700 }}>{item.value}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", gap: 20 }}>
        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>Financial Signals</h2>
          <ChartPlaceholder label="Invoice aging chart" />
          <ChartPlaceholder label="Payment timeliness chart" />
          <ChartPlaceholder label="Order trend chart" />
          <ChartPlaceholder label="Partial payment timeline" />
        </section>

        <section style={panelStyle}>
          <h2 style={panelTitleStyle}>AI Recommendation</h2>
          <div style={highlightPanelStyle}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)" }}>
              Recommended Action
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0 10px" }}>{detail.case_brief.recommended_action}</div>
            <div style={{ color: "var(--text-muted)" }}>{detail.case_brief.risk_summary}</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Business tradeoff</div>
            <div style={{ color: "var(--text-muted)" }}>{detail.case_brief.why_now}</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Next steps</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
              {detail.case_brief.next_steps.map((step) => (
                <li key={step} style={{ marginBottom: 6 }}>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <Link href={traceHref} style={secondaryLinkStyle}>
              View Trace
            </Link>
            <a href="#policy-section" style={secondaryLinkStyle}>
              View Policy Check
            </a>
            <a href="#triage-section" style={secondaryLinkStyle}>
              View Triage Inputs
            </a>
          </div>
        </section>

        <section style={{ display: "grid", gap: 20 }}>
          <section id="policy-section" style={panelStyle}>
            <h2 style={panelTitleStyle}>Policy</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
              {detail.policy_summary.map((item) => (
                <li key={item} style={{ marginBottom: 6 }}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section id="triage-section" style={panelStyle}>
            <h2 style={panelTitleStyle}>Triage Provenance</h2>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{detail.triage.case_source}</div>
            <div style={{ marginTop: 8, fontWeight: 700 }}>
              Score {detail.triage.triage_score} | {detail.triage.risk_band}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {detail.triage.trigger_reasons.map((trigger) => (
                <span key={trigger.label} style={miniChipStyle}>
                  {trigger.label}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
              Baseline review: {detail.triage.latest_baseline_review_at}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <Link href="/architecture?walkthrough=demo&step=architecture" style={secondaryLinkStyle}>
                View Triage Logic
              </Link>
              <Link href={traceHref} style={secondaryLinkStyle}>
                Open Latest Trace
              </Link>
            </div>
          </section>
        </section>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Live Vs Baseline State</h2>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
          <div style={{ color: "var(--text-muted)" }}>Case status</div>
          <div>{formatStatus(detail.case_status)}</div>
          <div style={{ color: "var(--text-muted)" }}>Approval status</div>
          <div>{formatStatus(detail.approval_status)}</div>
          <div style={{ color: "var(--text-muted)" }}>Latest run</div>
          <div>{detail.latest_run_id ?? "No live run linked yet"}</div>
          <div style={{ color: "var(--text-muted)" }}>Latest run state</div>
          <div>{formatStatus(detail.latest_run_status)}</div>
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Risk Drivers</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {detail.risk_drivers.map((driver) => (
            <span key={driver} style={softChipStyle}>
              {driver}
            </span>
          ))}
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Notes Timeline</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {["All", "Finance", "AM", "Promise to Pay", "Dispute"].map((filter) => (
            <span key={filter} style={miniChipStyle}>
              {filter}
            </span>
          ))}
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {detail.notes.map((note) => (
            <div key={note} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 14, background: "var(--panel-muted)" }}>
              {note}
            </div>
          ))}
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Evidence Panel</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          {["Invoices", "Payments", "Orders", "Notes", "Policy"].map((tab) => (
            <span key={tab} style={miniChipStyle}>
              {tab}
            </span>
          ))}
        </div>
        <div style={{ color: "var(--text-muted)" }}>
          Evidence records are still summarized at the case level here. Use the Data Explorer for deeper record-by-record inspection.
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Disputes Panel</h2>
        <div style={{ color: "var(--text-muted)" }}>No material open disputes for this case.</div>
      </section>
    </div>
  );
}

function ChartPlaceholder(props: { label: string }) {
  return (
    <div
      style={{
        border: "1px dashed var(--border)",
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        color: "var(--text-muted)",
        background: "var(--panel-muted)",
      }}
    >
      {props.label}
    </div>
  );
}

const panelStyle: CSSProperties = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 20,
};

const highlightPanelStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 18,
  background: "var(--accent-soft)",
};

const panelTitleStyle: CSSProperties = { marginTop: 0, marginBottom: 14, fontSize: 20 };

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

const softChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 600,
  fontSize: 12,
};

const miniChipStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--panel-muted)",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
  fontSize: 12,
};

const feedbackStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--accent)",
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontWeight: 600,
};
