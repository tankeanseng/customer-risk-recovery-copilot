import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { caseDetails } from "../../lib/demo-data";

export default async function CaseDetailPage(props: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await props.params;
  const detail = caseDetails[caseId];

  if (!detail) {
    notFound();
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <Link href="/portfolio" style={secondaryLinkStyle}>
              Back to Portfolio
            </Link>
            <Link href="/cases" style={secondaryLinkStyle}>
              Open in Cases
            </Link>
          </div>
          <h1 style={{ margin: 0 }}>{detail.customerName}</h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)" }}>{detail.meta}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {detail.badges.map((badge: string) => (
              <span key={badge} style={softChipStyle}>
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={primaryButtonStyle}>Run AI Review</button>
          <button style={secondaryButtonStyle}>Rerun Review</button>
          <Link href="/simulator" style={secondaryLinkStyle}>
            Open Simulator
          </Link>
          <Link href="/traces" style={secondaryLinkStyle}>
            View Full Trace
          </Link>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12 }}>
        {detail.riskSnapshot.map((item: { label: string; value: string }) => (
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
            <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0 10px" }}>{detail.recommendation.action}</div>
            <div style={{ color: "var(--text-muted)" }}>{detail.recommendation.why}</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Business tradeoff</div>
            <div style={{ color: "var(--text-muted)" }}>{detail.recommendation.tradeoff}</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Next steps</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
              {detail.recommendation.nextSteps.map((step: string) => (
                <li key={step} style={{ marginBottom: 6 }}>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <Link href="/traces" style={secondaryLinkStyle}>
              View Trace
            </Link>
            <button style={secondaryButtonStyle}>View Policy Check</button>
            <button style={secondaryButtonStyle}>View Triage Inputs</button>
          </div>
        </section>

        <section style={{ display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Policy</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
              {detail.policy.map((item: string) => (
                <li key={item} style={{ marginBottom: 6 }}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Triage Provenance</h2>
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Flagged by portfolio triage</div>
            <div style={{ marginTop: 8, fontWeight: 700 }}>
              Score {detail.triage.score} • {detail.triage.riskBand}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {detail.triage.triggers.map((trigger: string) => (
                <span key={trigger} style={miniChipStyle}>
                  {trigger}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 10, color: "var(--text-muted)" }}>{detail.triage.source}</div>
            <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
              Baseline review: {detail.triage.latestBaselineReviewAt}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button style={secondaryButtonStyle}>View Triage Logic</button>
              <button style={primaryButtonStyle}>Run Live AI Review</button>
            </div>
          </section>
        </section>
      </section>

      <section style={panelStyle}>
        <h2 style={panelTitleStyle}>Risk Drivers</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {detail.riskDrivers.map((driver: string) => (
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
          {detail.notes.map((note: string) => (
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
          Selected driver highlights and linked records will appear here once the interactive evidence layer is implemented.
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
