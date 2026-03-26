# Visual Wireframes: Remaining Pages

This document covers the remaining pages after the 5 highest-priority screens:

1. Approvals
2. Evaluation
3. Optimization
4. Data Explorer
5. Architecture
6. Cases

These wireframes are implementation-ready and should be used together with:

- `ui-visual-wireframes-key-pages.md`
- `ui-detailed-page-spec.md`
- `page-specs-and-api-contracts.md`

## Shared Layout Rules

- page title row always appears at top of main canvas
- primary action buttons live on the right side of the title row
- table pages use split layouts when detail inspection is important
- right-side detail panels should remain sticky where useful

---

# 1. Approvals Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: Approvals                                                                            |
| Subtitle: Review sensitive actions before the workflow proceeds                                  |
| Pending: 2 | Approved today: 5 | Rejected today: 1 | Revision requested: 1                      |
+--------------------------------------------------------------------------------------------------+
| FILTER BAR                                                                                       |
| Priority v | Status v | Region v | Search.................................... [Refresh Queue]   |
+----------------------------------------------------+---------------------------------------------+
| APPROVAL QUEUE                                     | APPROVAL DETAIL                             |
| Customer | Action | Risk | Wait | Priority | St   | Titan Facility Management Pte Ltd          |
| Titan FM | Pause  | Crit | 1h   | High     | Pn   | Requested Action                           |
| Green... | TempEx | High | 45m  | High     | Pn   | Pause new credit orders                    |
| ...                                                |                                             |
|                                                    | Risk Summary                                |
|                                                    | Critical risk due to 2 invoices > 60 days   |
|                                                    |                                             |
|                                                    | Policy Reason                               |
|                                                    | Rule pol_03 and pol_09 require approval     |
|                                                    |                                             |
|                                                    | Evidence Snapshot                           |
|                                                    | Overdue: 162,000 | Oldest: 68d             |
|                                                    | Drivers: threshold, aging, promises         |
|                                                    |                                             |
|                                                    | Decision Form                               |
|                                                    | Comment box................................  |
|                                                    | [Approve] [Reject] [Request Revision]       |
|                                                    |                                             |
|                                                    | Audit History                               |
|                                                    | requested -> reviewed -> ...                |
+----------------------------------------------------+---------------------------------------------+
```

## Layout ratios

- queue table: `46%`
- detail panel: `54%`

## Important visual rules

- selected queue row must be obvious
- detail panel action area should remain sticky
- policy reason and evidence snapshot must sit above the decision form
- audit trail should never hide the current decision controls

## Required button behavior

- `Refresh Queue`
  - refetch `GET /api/approvals`
- `Approve`
  - `POST /api/approvals/{approval_id}/approve`
  - on success, update queue row and show resumed workflow link if returned
- `Reject`
  - `POST /api/approvals/{approval_id}/reject`
- `Request Revision`
  - `POST /api/approvals/{approval_id}/revise`

## Mobile wireframe

```text
+----------------------------------------------+
| Approvals                                    |
| counts row                                   |
+----------------------------------------------+
| filters                                      |
+----------------------------------------------+
| approval list cards                          |
| [Titan FM] [Critical] [Open]                 |
+----------------------------------------------+
| selected approval detail card                |
| summary                                      |
| policy                                       |
| evidence                                     |
| comment box                                  |
| [Approve] [Reject]                           |
| [Request Revision]                           |
+----------------------------------------------+
| audit history                                |
+----------------------------------------------+
```

---

# 2. Evaluation Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: Evaluation                                                                           |
| Subtitle: Measured quality, trace-linked failures, and regression safety                         |
| Last run: 2026-03-25 09:00 | 24 scenarios | [Run Evaluation Suite]                              |
+--------------------------------------------------------------------------------------------------+
| KPI | KPI | KPI | KPI | KPI | KPI                                                                |
| Tool Acc | Rec Pass | Policy | Schema | Approval Routing | Avg Latency                           |
+----------------------------------------------------+---------------------------------------------+
| EVAL SCENARIO TABLE                                | FAILURE ANALYSIS                            |
| Scenario | Case | Expected | Actual | Pass | Trace | Selected failure                           |
| eval_12  | Horz | soft rec | soft rec | ok   | open  | Expected: monitor_or_soft_recovery        |
| eval_11  | Titan| restrict | temp ex  | fail | open  | Actual: temporary exception               |
| ...                                                | Likely cause: policy-rule underweight       |
|                                                    | [Open Trace] [Open Optimization]            |
+--------------------------------------------------------------------------------------------------+
| VERSION COMPARISON                                                                                |
| Baseline 0.84 | Optimized 0.89 | Delta +0.05 | trend chart | [Open Optimization]               |
+--------------------------------------------------------------------------------------------------+
```

## Layout ratios

- scenario table: `68%`
- failure analysis: `32%`

## Important visual rules

- failures should be visually obvious but not overwhelming
- selected failure row should sync with right panel
- version comparison should feel like a strong concluding proof section

## Required button behavior

- `Run Evaluation Suite`
  - `POST /api/evals/run`
  - disable while running
- `Open Trace`
  - navigate to linked run trace
- `Open Optimization`
  - navigate to Optimization page

## Mobile wireframe

```text
+----------------------------------------------+
| Evaluation                                   |
| [Run Evaluation Suite]                       |
+----------------------------------------------+
| KPI scroll row or 2-column grid              |
+----------------------------------------------+
| scenario list                                |
+----------------------------------------------+
| selected failure analysis                    |
+----------------------------------------------+
| version comparison                           |
+----------------------------------------------+
```

---

# 3. Optimization Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: Optimization                                                                         |
| Subtitle: DSPy-driven improvement of recommendation quality                                      |
| [View Evaluation Impact]                                                                         |
+--------------------------------------------------------------------------------------------------+
| SUMMARY CARD                                                                                     |
| Target: recovery_recommendation_quality | Framework: DSPy | Baseline 0.84 | Optimized 0.89      |
| Improvement +0.05                                                                                 |
+-----------------------------------------------+--------------------------------------------------+
| BASELINE VS OPTIMIZED                           | OPTIMIZATION METRICS                            |
| Baseline output                                 | score chart                                      |
| "Schedule customer review"                      | candidate count                                  |
| Optimized output                                | best run marker                                  |
| "Escalate review and prepare credit limit..."   |                                                   |
| key difference callouts                         |                                                   |
+-----------------------------------------------+--------------------------------------------------+
| EXPERIMENT HISTORY                              | SAMPLE OUTPUT COMPARISON                         |
| run id | task | baseline | best | date         | Case selector                                    |
| opt_01 | rec  | .84      | .89  | ...          | baseline output                                   |
| ...                                             | optimized output                                  |
|                                                 | explanation of gain                               |
+--------------------------------------------------------------------------------------------------+
```

## Layout ratios

- comparison: `56%`
- metrics: `44%`
- history: `45%`
- sample comparison: `55%`

## Required button behavior

- `View Evaluation Impact`
  - navigate to Evaluation page

## Mobile wireframe

```text
+----------------------------------------------+
| Optimization                                 |
+----------------------------------------------+
| summary card                                 |
+----------------------------------------------+
| baseline vs optimized                        |
+----------------------------------------------+
| metrics                                      |
+----------------------------------------------+
| sample comparison                            |
+----------------------------------------------+
| experiment history                           |
+----------------------------------------------+
```

---

# 4. Data Explorer Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: Data Explorer                                                                        |
| Subtitle: Browse the built-in records used by the AI workflows                                   |
| Search.......................................................... [Reset Filters]                 |
+--------------------------------------------------------------------------------------------------+
| SUMMARY CARDS                                                                                   |
| Customers | Invoices | Payments | Orders | Notes | Disputes | Policies                          |
+--------------------------------------------------------------------------------------------------+
| DOMAIN TABS: customers | invoices | payments | orders | notes | disputes | policies             |
+----------------------------------------------------+---------------------------------------------+
| RECORDS TABLE                                      | RECORD DETAIL                                |
| Customer / Invoice / ... columns                   | Full detail                                  |
| row 1                                              | linked customer                              |
| row 2                                              | linked cases                                 |
| row 3                                              | linked runs                                  |
| ...                                                | used in latest AI review badge               |
|                                                    | [Open Case] [Open Trace]                     |
+----------------------------------------------------+---------------------------------------------+
```

## Layout ratios

- records table: `70%`
- detail panel: `30%`

## Important visual rules

- detail panel should slide in or pin on the right
- linked relationships need to be obvious
- records used in the latest recommendation should get a distinct badge

## Required button behavior

- `Reset Filters`
  - clear local filters and search
- `Open Case`
  - navigate to linked case
- `Open Trace`
  - navigate to linked run trace

## Mobile wireframe

```text
+----------------------------------------------+
| Data Explorer                                |
| search                                       |
+----------------------------------------------+
| summary cards scroll row                     |
+----------------------------------------------+
| domain tabs                                  |
+----------------------------------------------+
| records list                                 |
+----------------------------------------------+
| detail drawer modal                          |
| [Open Case] [Open Trace]                     |
+----------------------------------------------+
```

---

# 5. Architecture Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: Architecture                                                                         |
| Subtitle: Product flow, AI workflow, MCP topology, and deployment architecture                   |
+--------------------------------------------------------------------------------------------------+
| HERO                                                                                             |
| Customer Risk & Recovery Copilot architecture overview                                           |
| LangGraph | MCP | LiteLLM | OpenAI | Evals | DSPy                                                |
+--------------------------------------------------------------------------------------------------+
| PRODUCT FLOW DIAGRAM                                                                             |
+--------------------------------------------------------------------------------------------------+
| TECHNICAL ARCHITECTURE DIAGRAM                                                                   |
+-----------------------------------------------+--------------------------------------------------+
| MCP TOPOLOGY                                   | SPECIALIST AGENTS                               |
| customer-profile-mcp                           | Case Intake Agent                               |
| ar-analytics-mcp                               | Financial Risk Agent                            |
| notes-policy-mcp                               | Relationship Agent                              |
| case-actions-mcp                               | Policy Check Agent                              |
|                                                | Recovery Strategy Agent                         |
+--------------------------------------------------------------------------------------------------+
| DEPLOYMENT TOPOLOGY                                                                            |
| Next.js -> CloudFront -> API Gateway -> Lambda/FastAPI -> LangGraph -> LiteLLM -> OpenAI API   |
+--------------------------------------------------------------------------------------------------+
```

## Important visual rules

- diagrams should be visually cleaner than data pages
- this page is explanatory, not operational
- use clear grouping and directional flow

## Mobile wireframe

```text
+----------------------------------------------+
| Architecture                                 |
+----------------------------------------------+
| hero                                         |
+----------------------------------------------+
| product flow                                 |
+----------------------------------------------+
| technical architecture                       |
+----------------------------------------------+
| MCP topology                                 |
+----------------------------------------------+
| specialist agents                            |
+----------------------------------------------+
| deployment topology                          |
+----------------------------------------------+
```

---

# 6. Cases Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: Cases                                                                                |
| Subtitle: Track review cases through triage, AI review, and approval                             |
| Search......................................................... [Create Case]                    |
+--------------------------------------------------------------------------------------------------+
| STATUS STRIP                                                                                    |
| New | In Review | Awaiting Approval | Approved | Rejected | Resolved                            |
+----------------------------------------------------+---------------------------------------------+
| CASE QUEUE TABLE                                   | ACTIVITY FEED                               |
| Case ID | Customer | Status | Priority | Rec |... | event cards                                  |
| case_011 | Titan FM | awaiting ...                | approval requested                            |
| case_012 | Horizon  | in review                   | run completed                                 |
| ...                                                | simulation saved                              |
+----------------------------------------------------+---------------------------------------------+
```

## Layout ratios

- queue table: `72%`
- activity feed: `28%`

## Required button behavior

- `Create Case`
  - open create-case modal or navigate to create flow
  - `POST /api/cases`
- row `Open`
  - navigate to case
- row `Run`
  - `POST /api/cases/{case_id}/runs`
- row `Trace`
  - open latest run trace

## Mobile wireframe

```text
+----------------------------------------------+
| Cases                                        |
| search | [Create Case]                       |
+----------------------------------------------+
| status chips                                 |
+----------------------------------------------+
| case cards/list                              |
+----------------------------------------------+
| activity feed                                |
+----------------------------------------------+
```

---

## Remaining Pages Consistency Checks

Before implementation:

- every destructive or decision action has a loading and success/error state
- every table row action maps to an endpoint or pure navigation
- right-side detail panels always have a no-selection placeholder
- mobile keeps all major actions accessible without horizontal overflow

