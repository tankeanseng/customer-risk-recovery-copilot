"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type WalkthroughStep = {
  id: string;
  href: string;
  title: string;
  eyebrow: string;
  summary: string;
  checklist: string[];
  nextLabel: string;
};

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: "overview",
    href: "/?walkthrough=demo&step=overview",
    eyebrow: "Step 1 of 10",
    title: "Start from the portfolio story",
    summary:
      "Use the overview page to explain what the platform watches every morning: flagged accounts, pending approvals, live runs, and the recommended demo customer.",
    checklist: [
      "Point out the daily risk briefing and the portfolio KPI strip.",
      "Call out Horizon Foodservice as the recommended walkthrough case.",
      "Use the next step instead of free navigation so the demo stays coherent.",
    ],
    nextLabel: "Open Portfolio",
  },
  {
    id: "portfolio",
    href: "/portfolio?walkthrough=demo&step=portfolio",
    eyebrow: "Step 2 of 10",
    title: "Show triage at portfolio scale",
    summary:
      "Demonstrate how triage narrows attention down to a manageable set of accounts before any deeper AI review starts.",
    checklist: [
      "Use the risk filter and search to show the queue is explorable.",
      "Open Horizon Foodservice to move from portfolio monitoring into case work.",
      "Explain that only a subset of accounts need deeper review.",
    ],
    nextLabel: "Open Demo Case",
  },
  {
    id: "case",
    href: "/cases/case_012?walkthrough=demo&step=case",
    eyebrow: "Step 3 of 10",
    title: "Review one customer case deeply",
    summary:
      "This is the main analyst workspace: baseline risk, case brief, policy context, and the live AI review button all come together here.",
    checklist: [
      "Explain the baseline brief before running any new analysis.",
      "Use Run AI Review to generate a live recommendation and real trace id.",
      "Mention that approvals and simulations branch off from this page.",
    ],
    nextLabel: "Open Trace",
  },
  {
    id: "trace",
    href: "/traces?caseId=case_012&walkthrough=demo&step=trace",
    eyebrow: "Step 4 of 10",
    title: "Open the execution trace",
    summary:
      "Use the trace page to make the AI workflow explainable. This is where users can see LangGraph steps, MCP tool calls, and the model call behind the recommendation.",
    checklist: [
      "Point out the workflow timeline and recent runs for the case.",
      "Show the MCP tool calls and explain that structured context is gathered before reasoning.",
      "Use this step to introduce LangSmith as the observability layer.",
    ],
    nextLabel: "Open Simulator",
  },
  {
    id: "simulator",
    href: "/simulator?walkthrough=demo&step=simulator",
    eyebrow: "Step 5 of 10",
    title: "Stress-test the recommendation",
    summary:
      "The simulator answers the question: what if the customer profile changes? It now reuses the live AI review workflow with scenario-adjusted inputs.",
    checklist: [
      "Adjust at least one customer profile or payment stress input.",
      "Run the simulation and compare the scenario result against the baseline.",
      "Mention that simulation runs also have trace links.",
    ],
    nextLabel: "Open Approvals",
  },
  {
    id: "approvals",
    href: "/approvals?walkthrough=demo&step=approvals",
    eyebrow: "Step 6 of 10",
    title: "Show the human control point",
    summary:
      "This page makes the system credible: high-impact recommendations are not blindly auto-executed and can be reviewed by a human approver.",
    checklist: [
      "Select a queue item and review the rationale panel.",
      "Explain approve, reject, and revision outcomes.",
      "Connect the approval queue back to case review and policy rules.",
    ],
    nextLabel: "Open Evaluation",
  },
  {
    id: "evaluation",
    href: "/evaluation?walkthrough=demo&step=evaluation",
    eyebrow: "Step 7 of 10",
    title: "Prove the model is not a black box",
    summary:
      "Use evaluation to show repeatability, saved scenario scoring, and why the chosen model is a cost-quality compromise rather than a guess.",
    checklist: [
      "Show the saved model comparison results.",
      "Highlight the default model and why nano is not the main review model.",
      "Use a scenario row to connect evaluation back to real cases and traces.",
    ],
    nextLabel: "Open Optimization",
  },
  {
    id: "optimization",
    href: "/optimization?walkthrough=demo&step=optimization",
    eyebrow: "Step 8 of 10",
    title: "Explain how the system gets better",
    summary:
      "Optimization is where future DSPy-style tuning and before-versus-after quality gains are explained in business terms.",
    checklist: [
      "Show baseline versus optimized comparison.",
      "Explain that optimization should be backed by evaluation rather than taste.",
      "Position this page as the improvement loop for the AI program.",
    ],
    nextLabel: "Open Data Explorer",
  },
  {
    id: "data-explorer",
    href: "/data-explorer?walkthrough=demo&step=data-explorer",
    eyebrow: "Step 9 of 10",
    title: "Make the data lineage tangible",
    summary:
      "Use the Data Explorer to show the raw records behind the AI system: customers, invoices, payments, notes, disputes, and policies.",
    checklist: [
      "Switch between a few domains to show coverage.",
      "Open a record and point out linked customer and case relationships.",
      "Explain that this is the easiest place to answer where a recommendation came from.",
    ],
    nextLabel: "Open Architecture",
  },
  {
    id: "architecture",
    href: "/architecture?walkthrough=demo&step=architecture",
    eyebrow: "Step 10 of 10",
    title: "Close with the technical architecture",
    summary:
      "Finish by connecting the user experience back to the underlying stack: LiteLLM, LangGraph, MCP, LangSmith, evaluation, optimization, and later deployment to CloudFront plus Lambda.",
    checklist: [
      "Call out which parts are already live versus still planned.",
      "Use the MCP and LangGraph sections to recap the workflow path users already saw.",
      "End by reinforcing that the architecture supports explainability, cost control, and future deployment.",
    ],
    nextLabel: "Restart Walkthrough",
  },
];

function getStep(pathname: string, stepId: string | null): WalkthroughStep {
  if (stepId) {
    const explicit = walkthroughSteps.find((step) => step.id === stepId);
    if (explicit) {
      return explicit;
    }
  }

  if (pathname === "/portfolio") {
    return walkthroughSteps[1];
  }
  if (pathname.startsWith("/cases/")) {
    return walkthroughSteps[2];
  }
  if (pathname === "/traces") {
    return walkthroughSteps[3];
  }
  if (pathname === "/simulator") {
    return walkthroughSteps[4];
  }
  if (pathname === "/approvals") {
    return walkthroughSteps[5];
  }
  if (pathname === "/evaluation") {
    return walkthroughSteps[6];
  }
  if (pathname === "/optimization") {
    return walkthroughSteps[7];
  }
  if (pathname === "/data-explorer") {
    return walkthroughSteps[8];
  }
  if (pathname === "/architecture") {
    return walkthroughSteps[9];
  }
  return walkthroughSteps[0];
}

export function DemoWalkthrough() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const walkthroughMode = searchParams.get("walkthrough");

  if (walkthroughMode !== "demo") {
    return null;
  }

  const step = getStep(pathname, searchParams.get("step"));
  const currentIndex = walkthroughSteps.findIndex((item) => item.id === step.id);
  const previousStep = currentIndex > 0 ? walkthroughSteps[currentIndex - 1] : null;
  const nextStep = currentIndex === walkthroughSteps.length - 1 ? walkthroughSteps[0] : walkthroughSteps[currentIndex + 1];

  return (
    <aside
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        width: 360,
        maxWidth: "calc(100vw - 32px)",
        zIndex: 30,
        borderRadius: 22,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.96)",
        boxShadow: "0 18px 48px rgba(27, 44, 48, 0.16)",
        backdropFilter: "blur(14px)",
        padding: 20,
        display: "grid",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            Guided Demo
          </div>
          <div style={{ marginTop: 6, fontWeight: 700, fontSize: 20 }}>{step.title}</div>
        </div>
        <Link
          href={pathname}
          style={{
            color: "var(--text-muted)",
            fontWeight: 700,
            textDecoration: "none",
            padding: "4px 8px",
            borderRadius: 999,
            background: "var(--panel-muted)",
          }}
        >
          Exit
        </Link>
      </div>

      <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>{step.eyebrow}</div>
      <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.5 }}>{step.summary}</p>

      <div
        style={{
          borderRadius: 16,
          background: "var(--panel-muted)",
          border: "1px solid var(--border)",
          padding: 14,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>What to show here</div>
        <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)", display: "grid", gap: 6 }}>
          {step.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {previousStep ? (
          <Link
            href={previousStep.href}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              color: "var(--text)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Previous
          </Link>
        ) : null}
        <Link
          href={nextStep.href}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid var(--accent)",
            background: "var(--accent)",
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {step.nextLabel}
        </Link>
      </div>
    </aside>
  );
}
