import Link from "next/link";
import type { ReactNode } from "react";

import { overviewData } from "./lib/demo-data";

export default function OverviewPage() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 24,
          padding: 28,
          borderRadius: 20,
          background: "var(--panel)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            Daily Risk Briefing
          </div>
          <h1 style={{ margin: "8px 0 12px", fontSize: 34 }}>{overviewData.hero.title}</h1>
          <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 720 }}>{overviewData.hero.subtitle}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <ActionLink href="/?walkthrough=demo&step=overview" primary>
              Launch Demo Walkthrough
            </ActionLink>
            <ActionLink href="/architecture?walkthrough=demo&step=architecture">Open Architecture</ActionLink>
            <ActionLink href="/portfolio">View Portfolio</ActionLink>
          </div>
        </div>

        <div
          style={{
            minWidth: 280,
            padding: 18,
            borderRadius: 18,
            background: "var(--panel-muted)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Portfolio status</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
            <li>14 active accounts tracked</li>
            <li>8 flagged by triage</li>
            <li>5 recommended for AI review</li>
          </ul>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 14 }}>
        {overviewData.kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: 18,
            }}
          >
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{kpi.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, margin: "8px 0 4px" }}>{kpi.value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{kpi.note}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        <Panel title="Critical Cases">
          <div style={{ display: "grid", gap: 12 }}>
            {overviewData.criticalCases.map((item) => (
              <div
                key={item.caseId}
                style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, background: "var(--panel-muted)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div style={{ fontWeight: 700 }}>{item.customerName}</div>
                  <Badge>{item.riskBand}</Badge>
                </div>
                <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
                  Triage {item.triageScore} | Overdue {item.overdueExposure}
                </div>
                <div style={{ marginTop: 8 }}>{item.reason}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {item.chips.map((chip) => (
                    <Chip key={chip}>{chip}</Chip>
                  ))}
                </div>
                <div style={{ marginTop: 10, color: "var(--text-muted)" }}>{item.recommendation}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <ActionLink href={`/cases/${item.caseId}?walkthrough=demo&step=case`} primary>
                    Open Case
                  </ActionLink>
                  <ActionLink href={`/traces?caseId=${item.caseId}&walkthrough=demo&step=trace`}>View Trace</ActionLink>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: "grid", gap: 20 }}>
          <Panel title="Active AI Runs">
            {overviewData.activeRuns.map((run) => (
              <div key={run.runId} style={{ display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 700 }}>{run.customerName}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  {run.status} | {run.node} | {run.elapsed}
                </div>
                <ActionLink href={`/traces?walkthrough=demo&step=trace&runId=${run.runId}`}>Open Trace</ActionLink>
              </div>
            ))}
          </Panel>

          <Panel title="Pending Approvals">
            <div style={{ display: "grid", gap: 12 }}>
              {overviewData.pendingApprovals.map((approval) => (
                <div key={approval.approvalId} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                  <div style={{ fontWeight: 700 }}>{approval.customerName}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    {approval.action} | {approval.priority} | waiting {approval.waiting}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <ActionLink href="/approvals?walkthrough=demo&step=approvals">Open Approval</ActionLink>
                    <ActionLink href={`/cases/${approval.caseId}?walkthrough=demo&step=case`}>Open Case</ActionLink>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr", gap: 20 }}>
        <Panel title="Recommended Demo Walkthrough">
          <div style={{ fontWeight: 700 }}>{overviewData.demoWalkthrough.recommendedCustomerName}</div>
          <ol style={{ marginTop: 12, color: "var(--text-muted)" }}>
            {overviewData.demoWalkthrough.steps.map((step) => (
              <li key={step} style={{ marginBottom: 6 }}>
                {step}
              </li>
            ))}
          </ol>
          <ActionLink href="/?walkthrough=demo&step=overview" primary>
            Start Guided Demo
          </ActionLink>
        </Panel>

        <Panel title="AI System Snapshot">
          <div style={{ display: "grid", gap: 8, color: "var(--text-muted)" }}>
            <div>MCP servers: 4</div>
            <div>Specialist agents: 5</div>
            <div>Latest eval pass rate: 91%</div>
            <div>Optimization target: recovery recommendation quality</div>
            <div>Triage pass timestamp: 2026-03-26 09:00</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <ActionLink href="/evaluation?walkthrough=demo&step=evaluation">View Evaluation</ActionLink>
            <ActionLink href="/optimization?walkthrough=demo&step=optimization">View Optimization</ActionLink>
            <ActionLink href="/architecture?walkthrough=demo&step=architecture">View Triage Logic</ActionLink>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Panel(props: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: 20,
        background: "var(--panel)",
        padding: 20,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20 }}>{props.title}</h2>
      {props.children}
    </section>
  );
}

function ActionLink(props: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <Link
      href={props.href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 14px",
        borderRadius: 12,
        border: props.primary ? "1px solid var(--accent)" : "1px solid var(--border)",
        background: props.primary ? "var(--accent)" : "var(--panel)",
        color: props.primary ? "white" : "var(--text)",
        fontWeight: 600,
      }}
    >
      {props.children}
    </Link>
  );
}

function Badge(props: { children: ReactNode }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "#f8e4e2",
        color: "#9d3228",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {props.children}
    </span>
  );
}

function Chip(props: { children: ReactNode }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "var(--accent-soft)",
        color: "var(--accent)",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {props.children}
    </span>
  );
}
