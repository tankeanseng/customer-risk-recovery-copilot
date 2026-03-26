# Page Specs And API Contracts

## High-level data flow

```text
Next.js frontend
-> FastAPI backend
-> LangGraph workflow
-> LiteLLM
-> OpenAI API
-> MCP servers
-> persistence and traces
```

## Main MCP servers

- `customer-profile-mcp`
- `ar-analytics-mcp`
- `notes-policy-mcp`
- `case-actions-mcp`

## Main structured outputs

- `CaseIntakePlan`
- `FinancialRiskAssessment`
- `RelationshipAssessment`
- `RecoveryActionRecommendation`
- `PolicyCheckResult`
- `SimulationDeltaReport`
- `CaseDecisionBrief`

## Core pages

### Overview

Purpose:

- orient the user quickly
- show urgent cases, active runs, pending approvals, and guided demo entry

Main components:

- `OverviewHero`
- `OverviewKpiStrip`
- `CriticalCasesPanel`
- `ActiveRunsPanel`
- `PendingApprovalsPanel`
- `DemoWalkthroughCard`
- `AiSystemSnapshot`

Main API:

- `GET /api/overview`
- `GET /api/triage/rules`

### Portfolio

Purpose:

- browse the customer portfolio by risk and exposure

Main components:

- `PortfolioHeader`
- `PortfolioFiltersBar`
- `PortfolioKpiStrip`
- `CustomerRiskTable`
- `PortfolioChartsRow`
- `PortfolioAlertsRail`

Main APIs:

- `GET /api/portfolio`

Important response fields for rows:

- `triage_score`
- `risk_band`
- `trigger_reasons`
- `hard_trigger_hit`
- `ai_review_recommended`
- `auto_case_create`
- `latest_review_mode` (`baseline` or `live`)

### Customer Case

Purpose:

- investigate one customer deeply

Main components:

- `CustomerCaseHeader`
- `CaseActionBar`
- `RiskSnapshotStrip`
- `FinancialSignalsPanel`
- `NotesTimelinePanel`
- `DisputesPanel`
- `AiRecommendationPanel`
- `EvidencePanel`
- `PolicyPanel`

Main APIs:

- `GET /api/cases/{case_id}`
- `POST /api/cases/{case_id}/runs`
- `POST /api/cases/{case_id}/approval-requests`
- `GET /api/cases/{case_id}/brief/export`

Important response fields:

- triage provenance
- trigger reasons
- hard trigger indicator
- latest baseline review timestamp
- latest review mode (`baseline` or `live`)

### AI Workflow Trace

Purpose:

- visualize the LangGraph workflow, tool calls, structured outputs, and model routing

Main components:

- `RunHeader`
- `WorkflowGraphPanel`
- `RunTimelinePanel`
- `ToolCallsPanel`
- `StructuredOutputsPanel`
- `ModelRoutingPanel`
- `RunEventsPanel`

Main API:

- `GET /api/runs/{run_id}`
- `GET /api/runs/{run_id}/status`
- `POST /api/runs/{run_id}/replay`
- `GET /api/runs/{run_id}/compare`

### What-If Simulator

Purpose:

- let users modify case conditions and compare before/after outcomes

Main components:

- `SimulatorHeader`
- `ScenarioControlsPanel`
- `ScenarioPresetsBar`
- `BeforeAfterComparisonPanel`
- `ImpactExplanationPanel`
- `SimulationHistoryPanel`

Main APIs:

- `POST /api/cases/{case_id}/simulate`
- `GET /api/cases/{case_id}/simulations`
- `GET /api/simulations/{simulation_id}`
- `POST /api/simulations/{simulation_id}/save`
- `DELETE /api/simulations/{simulation_id}`

### Cases

Purpose:

- manage all recovery cases by workflow status

Main components:

- `CasesHeader`
- `CaseStatusSummaryStrip`
- `CaseQueueTable`
- `CaseActivityFeedPanel`

Main APIs:

- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/{case_id}/activity`

### Approvals

Purpose:

- review and decide sensitive AI recommendations

Main components:

- `ApprovalsHeader`
- `ApprovalQueueTable`
- `ApprovalDetailPanel`
- `DecisionAuditPanel`

Main APIs:

- `GET /api/approvals`
- `GET /api/approvals/{approval_id}`
- `POST /api/approvals/{approval_id}/approve`
- `POST /api/approvals/{approval_id}/reject`
- `POST /api/approvals/{approval_id}/revise`

### Evaluation

Purpose:

- expose measurable quality and regression safety

Main components:

- `EvaluationHeader`
- `EvalKpiStrip`
- `EvalScenarioTable`
- `FailureAnalysisPanel`
- `VersionComparisonPanel`

Main APIs:

- `GET /api/evals/summary`
- `GET /api/evals/scenarios`
- `POST /api/evals/run`
- `GET /api/evals/runs/{eval_run_id}`

### Optimization

Purpose:

- show the DSPy optimization layer and baseline vs optimized behavior

Main components:

- `OptimizationHeader`
- `OptimizationSummaryCard`
- `BaselineVsOptimizedPanel`
- `OptimizationMetricsPanel`
- `ExperimentHistoryTable`
- `SampleOutputComparisonPanel`

Main APIs:

- `GET /api/optimization/summary`
- `GET /api/optimization/runs`
- `GET /api/optimization/runs/{optimization_run_id}`

### Data Explorer

Purpose:

- make the built-in demo dataset transparent and believable

Main components:

- `DataExplorerHeader`
- `DataSummaryStrip`
- `DataDomainTabs`
- `DataRecordsTable`
- `RecordDetailDrawer`

Main APIs:

- `GET /api/data/summary`
- `GET /api/data/customers`
- `GET /api/data/invoices`
- `GET /api/data/payments`
- `GET /api/data/orders`
- `GET /api/data/notes`
- `GET /api/data/disputes`
- `GET /api/data/policies`
- `GET /api/data/records/{record_type}/{record_id}`

### Architecture

Purpose:

- explain the system clearly to interviewers and reviewers

Main components:

- `ArchitectureHero`
- `ProductFlowDiagram`
- `TechnicalArchitectureDiagram`
- `McpTopologyPanel`
- `SpecialistAgentsPanel`
- `DeploymentTopologyPanel`

Main API:

- `GET /api/architecture`

## Main domain states

### Case status

- `new`
- `in_review`
- `awaiting_approval`
- `approved`
- `rejected`
- `resolved`

### Run status

- `queued`
- `running`
- `completed`
- `failed`
- `paused_for_approval`
- `resumed`

### Approval status

- `pending`
- `approved`
- `rejected`
- `revision_requested`

### Simulation status

- `draft`
- `running`
- `completed`
- `failed`
- `saved`

## Core user actions

- browse and filter portfolio
- open a customer case
- run or rerun AI review
- inspect the workflow trace
- change what-if simulation inputs
- save and compare scenarios
- approve, reject, or revise recommendations
- inspect eval failures and optimization improvements
- browse demo data and jump to linked cases or runs

## Important non-page endpoints

- `GET /api/triage/rules`
  - used by `View Triage Logic`
- `POST /api/cases/{case_id}/approval-requests`
  - used by `Submit For Approval`
- `GET /api/cases/{case_id}/brief/export`
  - used by `Export Brief`
- `GET /api/runs/{run_id}/status`
  - used for active-run polling
- `POST /api/runs/{run_id}/replay`
  - used by `Replay Run`
- `GET /api/runs/{run_id}/compare?other_run_id=...`
  - used by `Compare Run`
- `POST /api/simulations/{simulation_id}/save`
  - used by `Save Scenario`
- `DELETE /api/simulations/{simulation_id}`
  - used by `Delete Scenario`

## Recommended implementation sequence

1. Turn these docs into UI wireframe specs.
2. Scaffold the Next.js and FastAPI applications.
3. Implement mock/demo data and the API contracts first.
4. Build the frontend shell and page routing.
5. Build `Overview`, `Portfolio`, and `Customer Case`.
6. Build run execution and `AI Workflow Trace`.
7. Build `What-If Simulator` and `Approvals`.
8. Build `Evaluation`, `Optimization`, `Data Explorer`, and `Architecture`.
9. Replace mock orchestration with the real LangGraph + MCP workflow.
