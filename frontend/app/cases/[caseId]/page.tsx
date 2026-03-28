import { notFound } from "next/navigation";

import { caseDetails, casesData } from "../../lib/demo-data";
import { CaseDetailClient } from "./case-detail-client";

export function generateStaticParams() {
  return casesData.rows.map((row) => ({ caseId: row.caseId }));
}

export default async function CaseDetailPage(props: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await props.params;
  const detail = buildInitialCaseDetail(caseId);

  if (!detail) {
    notFound();
  }

  return <CaseDetailClient caseId={caseId} initialDetail={detail} />;
}

function buildInitialCaseDetail(caseId: string) {
  const rich = caseDetails[caseId];
  const row = casesData.rows.find((item) => item.caseId === caseId);
  if (!row) return null;

  if (rich) {
    return {
      case_id: caseId,
      customer_name: rich.customerName,
      segment: row.segment,
      region: row.region,
      case_status: row.status.toLowerCase().replaceAll(" ", "_"),
      approval_status: row.approvalStatus.toLowerCase().replaceAll(" ", "_"),
      latest_run_id: null,
      latest_run_status: row.latestRunStatus.toLowerCase().replaceAll(" ", "_"),
      latest_approval_id: null,
      relationship_duration: rich.meta.split("|")[2]?.trim() ?? "Demo profile",
      payment_terms: rich.meta.split("|")[3]?.trim() ?? "Terms vary by account",
      credit_limit: Number((rich.meta.match(/Credit Limit ([0-9,]+)/)?.[1] ?? "0").replaceAll(",", "")),
      account_owner: rich.meta.split("|")[5]?.replace("Owner:", "").trim() ?? "Assigned account lead",
      strategic: rich.badges[0]?.replace("Strategic: ", "") ?? "Unknown",
      tier: rich.badges[1]?.replace("Tier: ", "") ?? "Demo",
      risk_band: rich.riskSnapshot[0]?.value ?? "Monitor",
      risk_score: Number(rich.riskSnapshot[1]?.value ?? "50"),
      triage: {
        triage_score: rich.triage.score,
        risk_band: rich.triage.riskBand,
        trigger_reasons: rich.triage.triggers.map((label: string) => ({ label })),
        latest_baseline_review_at: rich.triage.latestBaselineReviewAt,
        case_source: rich.triage.source,
      },
      case_brief: {
        customer_summary: rich.customerName,
        risk_summary: rich.recommendation.why,
        recommended_action: rich.recommendation.action,
        why_now: rich.recommendation.tradeoff,
        policy_status: rich.policy.join(" | "),
        next_steps: rich.recommendation.nextSteps,
      },
      risk_drivers: rich.riskDrivers,
      notes: rich.notes,
      policy_summary: rich.policy,
    };
  }

  return {
    case_id: caseId,
    customer_name: row.customerName,
    segment: row.segment,
    region: row.region,
    case_status: row.status.toLowerCase().replaceAll(" ", "_"),
    approval_status: row.approvalStatus.toLowerCase().replaceAll(" ", "_"),
    latest_run_id: null,
    latest_run_status: row.latestRunStatus.toLowerCase().replaceAll(" ", "_"),
    latest_approval_id: null,
    relationship_duration: "Demo profile",
    payment_terms: "Terms vary by account",
    credit_limit: 0,
    account_owner: "Assigned account lead",
    strategic: "Unknown",
    tier: "Demo",
    risk_band: row.status === "Awaiting Approval" ? "Critical" : row.priority === "High" ? "High" : "Monitor",
    risk_score: 50,
    triage: {
      triage_score: 50,
      risk_band: row.status === "Awaiting Approval" ? "Critical" : row.priority === "High" ? "High" : "Monitor",
      trigger_reasons: [{ label: row.triggerReason }],
      latest_baseline_review_at: row.updatedAt,
      case_source: "Generated from case queue metadata",
    },
    case_brief: {
      customer_summary: `${row.customerName} loaded from queue metadata.`,
      risk_summary: row.triggerReason,
      recommended_action: row.latestRecommendation,
      why_now: "Fallback detail is being used while richer account detail is expanded.",
      policy_status: `Approval status: ${row.approvalStatus}`,
      next_steps: ["Open trace if available", "Run live AI review", "Inspect queue state"],
    },
    risk_drivers: [row.triggerReason, row.latestRecommendation],
    notes: [
      "Full narrative detail for this account is still being expanded in the demo dataset.",
      "Queue, workflow, and action handling remain available.",
    ],
    policy_summary: ["Fallback detail view", "Use trace, approvals, and queue state for current demo behavior"],
  };
}
