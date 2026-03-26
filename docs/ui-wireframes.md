# UI Wireframe Spec

This file defines the wireframe-level UI design for all pages in Customer Risk & Recovery Copilot.

The goal is not pixel-perfect visual design yet. The goal is to lock:

- page layout
- section order
- component placement
- interaction priorities
- information hierarchy
- demo flow clarity

Design direction:

- light-first premium intelligence dashboard
- calm, authoritative, AI-native operational feel
- left sidebar navigation on desktop
- top app bar with search, demo mode indicator, and global actions

## Global App Shell

### Desktop layout

```text
+--------------------------------------------------------------------------------------+
| Top Bar: Product Name | Global Search | Demo Mode | Notifications | User Menu       |
+----------------------+---------------------------------------------------------------+
| Sidebar Nav          | Main Content Area                                             |
| - Overview           |                                                               |
| - Portfolio          |                                                               |
| - Cases              |                                                               |
| - Simulator          |                                                               |
| - Approvals          |                                                               |
| - Traces             |                                                               |
| - Evaluation         |                                                               |
| - Optimization       |                                                               |
| - Data Explorer      |                                                               |
| - Architecture       |                                                               |
+----------------------+---------------------------------------------------------------+
```

### Shared shell elements

- `TopBar`
  - product title
  - global search
  - demo mode badge
  - latest run indicator
  - notifications
  - user menu
- `SidebarNav`
  - page links
  - highlighted `Recommended Demo Walkthrough`
  - active page state

## 1. Overview Page

### Purpose

Immediate orientation page for users and interviewers.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Overview Hero                                                                        |
| Title | Subtitle | [Launch Demo Walkthrough] [Open Architecture]                     |
+--------------------------------------------------------------------------------------+
| KPI 1 | KPI 2 | KPI 3 | KPI 4 | KPI 5 | KPI 6                                        |
+-------------------------------------------+------------------------------------------+
| Critical Cases                            | Active Runs                              |
| - top risky customers                     | - running / paused workflows             |
| - recommendation snippet                  | - current node                           |
+-------------------------------------------+------------------------------------------+
| Pending Approvals                         | Demo Walkthrough                         |
| - 2-5 queue items                         | - recommended case                       |
|                                           | - step-by-step guided path               |
+--------------------------------------------------------------------------------------+
| AI System Snapshot                                                                   |
| MCP servers | specialist agents | latest eval score | optimization target            |
+--------------------------------------------------------------------------------------+
```

### Component notes

- Hero should feel strong and product-led, not marketing-heavy.
- Demo walkthrough card should be visually prominent because it guides interviewers.
- Critical cases should be clickable cards, not only a table.
- AI snapshot should summarize technical sophistication in a business-readable way.

### Core actions

- launch walkthrough
- open featured case
- open active run trace
- open approvals queue

## 2. Portfolio Page

### Purpose

Portfolio monitoring and customer prioritization.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Portfolio Header: title | search | quick actions                                     |
+--------------------------------------------------------------------------------------+
| Filters: region | segment | risk | approval | strategic | reset                      |
+--------------------------------------------------------------------------------------+
| KPI Cards: Exposure | Overdue | High Risk | Approval Needed                          |
+------------------------------------------------------+-------------------------------+
| Customer Risk Table                                   | Alerts Rail                  |
| customer | segment | overdue | risk | recommendation  | - urgent cases               |
| approval | last reviewed | actions                    | - threshold warnings         |
|                                                   ... | - simulator-ready cases     |
+------------------------------------------------------+-------------------------------+
| Chart 1: Risk Distribution | Chart 2: Overdue Exposure | Chart 3: Risk Movement      |
+--------------------------------------------------------------------------------------+
```

### Component notes

- Customer table is the dominant element.
- Alerts rail should be narrow but visible; it helps demo flow.
- Table rows should support quick actions:
  - open case
  - run review
  - compare
  - pin to simulator

### Core actions

- filter and search
- open customer case
- start AI review
- compare accounts

## 3. Customer Case Page

### Purpose

Primary investigation page for one customer.

### Desktop layout

```text
+--------------------------------------------------------------------------------------+
| Customer Header: Name | Segment | Region | Terms | Credit Limit | Strategic Badge    |
+--------------------------------------------------------------------------------------+
| Action Bar: [Run AI Review] [Rerun] [Open Simulator] [View Trace] [Submit Approval] |
+--------------------------------------------------------------------------------------+
| Risk Snapshot: Risk | Overdue | Oldest Due | Deterioration | Relationship | Approval |
+-------------------------------+--------------------------------+---------------------+
| Financial Signals             | AI Recommendation              | Policy Status       |
| - invoice aging chart         | - recommendation card          | - triggered rules   |
| - payment timeliness          | - why now                      | - compliance state  |
| - order trend                 | - top risk drivers             | - approval reason   |
| - partial payment timeline    | - business tradeoff            |                     |
+-------------------------------+--------------------------------+---------------------+
| Notes Timeline                                                                     |
| note cards with role, type, sentiment, promise markers                            |
+--------------------------------------------------------------------------------------+
| Evidence Panel                                                                    |
| invoices | payments | orders | notes | policy evidence                            |
+--------------------------------------------------------------------------------------+
| Disputes Panel                                                                     |
+--------------------------------------------------------------------------------------+
```

### Component notes

- Recommendation panel should be visually elevated.
- Risk drivers must be clickable and link to evidence.
- Financial charts should explain trend, not just display raw data.
- Notes timeline should support filtering by note type.

### Core actions

- run or rerun review
- inspect evidence tied to risk drivers
- open simulator
- view trace
- submit for approval
- export case brief

## 4. AI Workflow Trace Page

### Purpose

Show the AI process in a technically impressive but readable way.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Run Header: Run ID | Customer | Status | Duration | Cost | Model Routing Summary     |
+-------------------------------------------+------------------------------------------+
| Workflow Graph                             | Run Timeline                             |
| Intake -> Financial -> Relationship ->     | step | status | duration | model        |
| Policy -> Strategy -> Approval             |                                      ... |
+-------------------------------------------+------------------------------------------+
| Tool Calls Panel                           | Structured Outputs Panel                 |
| server | tool | node | latency             | tabs by node                             |
| input summary | output summary             | rendered typed outputs                   |
+-------------------------------------------+------------------------------------------+
| Model Routing Panel                        | Events Panel                             |
| node -> model -> route reason              | run started / paused / resumed / done    |
+--------------------------------------------------------------------------------------+
```

### Component notes

- Workflow graph is the hero component.
- Clicking a node should update:
  - tool calls shown
  - structured output preview
  - model routing details
- Tool calls should be summarized first, with optional raw detail drawer.

### Core actions

- inspect nodes
- replay run
- compare runs
- jump back to case

## 5. What-If Simulator Page

### Purpose

Interactive scenario testing.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Simulator Header: Customer | Baseline Risk | [Run Simulation] [Reset] [Save]        |
+------------------------------+--------------------------------+----------------------+
| Scenario Controls            | Before vs After                | Impact Explanation   |
| Payment Stress               | Baseline cards                 | what changed         |
| - overdue slider             | Simulated cards                | why recommendation   |
| - balance slider             | risk delta                     | changed              |
| - partial payment            | action delta                   | policy threshold     |
| Relationship                 | approval delta                 | impacts              |
| - order trend toggle         | changed drivers list           | affected agents      |
| - strategic toggle           |                                |                      |
| Operational                  |                                |                      |
| - dispute status             |                                |                      |
| - credit limit               |                                |                      |
+--------------------------------------------------------------------------------------+
| Scenario Presets: Miss Payment | Partial Payment | Dispute Resolved | Customer Recovers|
+--------------------------------------------------------------------------------------+
| Saved Scenario History                                                                  |
+--------------------------------------------------------------------------------------+
```

### Component notes

- Left panel uses user-friendly controls, not spreadsheet cells.
- Center panel must visually emphasize recommendation changes.
- Right panel should translate model behavior into business language.
- Presets make the demo easy for interviewers.

### Core actions

- tweak controls
- run simulation
- apply preset
- save scenario
- open simulation trace

## 6. Cases Page

### Purpose

Workflow-centric queue of recovery cases.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Cases Header: title | search | [Create Case]                                         |
+--------------------------------------------------------------------------------------+
| Status Summary: New | In Review | Awaiting Approval | Approved | Rejected | Resolved |
+------------------------------------------------------+-------------------------------+
| Case Queue Table                                      | Activity Feed                 |
| case id | customer | status | priority | rec         | latest events                 |
| approval | run status | updated | actions            | created / run / approval      |
+------------------------------------------------------+-------------------------------+
```

### Component notes

- Cases page should feel operational and queue-driven.
- Activity feed makes the app feel alive.
- Status summary cards should filter the table when clicked.

### Core actions

- search
- filter by status
- open case
- run review
- inspect activity

## 7. Approvals Page

### Purpose

Human decision center for sensitive AI recommendations.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Approvals Header: summary counts | filters                                            |
+------------------------------------------------------+-------------------------------+
| Approval Queue Table                                  | Approval Detail Panel         |
| customer | action | risk | wait time | priority      | summary                      |
| status                                           ... | policy reason                |
|                                                     | evidence snapshot            |
|                                                     | decision form                |
|                                                     | audit history                |
+------------------------------------------------------+-------------------------------+
```

### Component notes

- Detail panel should feel serious and authoritative.
- Decision buttons should be high clarity:
  - approve
  - reject
  - request revision
- Audit history stays visible below decision form.

### Core actions

- select approval
- approve
- reject
- request revision
- resume workflow

## 8. Evaluation Page

### Purpose

Show measurable quality and regression controls.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Evaluation Header                                                                    |
+--------------------------------------------------------------------------------------+
| KPI Cards: Tool Accuracy | Recommendation Pass | Policy Compliance | Schema Validity |
+------------------------------------------------------+-------------------------------+
| Evaluation Scenario Table                               | Failure Analysis            |
| scenario | expected | actual | pass/fail | trace        | selected failure details   |
+------------------------------------------------------+-------------------------------+
| Version Comparison Panel                                                          |
| baseline score | optimized score | delta | trend chart                              |
+--------------------------------------------------------------------------------------+
```

### Component notes

- Keep the page analytical, not flashy.
- Failure analysis panel should support drilldown.
- Version comparison should connect to Optimization page.

### Core actions

- inspect failed scenarios
- rerun eval suite
- compare versions
- open run trace from a failed scenario

## 9. Optimization Page

### Purpose

Show DSPy-driven optimization and before/after improvements.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Optimization Header                                                                  |
+--------------------------------------------------------------------------------------+
| Summary Card: target task | framework | baseline score | optimized score | delta     |
+-------------------------------------------+------------------------------------------+
| Baseline vs Optimized                      | Optimization Metrics                     |
| output diff                                | score chart                              |
| recommendation diff                        | candidate count                          |
+-------------------------------------------+------------------------------------------+
| Experiment History Table                   | Sample Output Comparison                 |
| run id | target | baseline | best | date   | case-specific before/after output       |
+--------------------------------------------------------------------------------------+
```

### Component notes

- This page should communicate “we improve systems scientifically.”
- Before/after panels should be highly legible and persuasive.

### Core actions

- inspect optimization run
- compare baseline vs optimized output
- inspect experiment history

## 10. Data Explorer Page

### Purpose

Show the built-in demo dataset transparently.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Data Explorer Header: title | search                                                 |
+--------------------------------------------------------------------------------------+
| Summary Cards: Customers | Invoices | Payments | Orders | Notes | Disputes | Policies|
+--------------------------------------------------------------------------------------+
| Domain Tabs: customers | invoices | payments | orders | notes | disputes | policies  |
+------------------------------------------------------+-------------------------------+
| Records Table                                           | Record Detail Drawer/Panel  |
| domain-specific columns                                 | full record detail          |
|                                                     ... | linked cases                |
|                                                          | linked runs                 |
|                                                          | used in latest run badge    |
+------------------------------------------------------+-------------------------------+
```

### Component notes

- This should not feel like a generic admin database.
- Use detail drawer with relationship links to keep it readable.

### Core actions

- switch domains
- search records
- open record detail
- jump to linked case
- jump to linked run trace

## 11. Architecture Page

### Purpose

Explain the system to interviewers quickly.

### Layout

```text
+--------------------------------------------------------------------------------------+
| Architecture Hero                                                                    |
+--------------------------------------------------------------------------------------+
| Product Flow Diagram                                                                 |
+--------------------------------------------------------------------------------------+
| Technical Architecture Diagram                                                       |
+-------------------------------------------+------------------------------------------+
| MCP Topology                              | Specialist Agents                        |
| customer-profile-mcp                      | intake                                   |
| ar-analytics-mcp                          | financial risk                           |
| notes-policy-mcp                          | relationship                             |
| case-actions-mcp                          | policy check / strategy                  |
+-------------------------------------------+------------------------------------------+
| Deployment Topology                                                                  |
| Next.js -> CloudFront -> API Gateway -> Lambda -> LangGraph -> LiteLLM -> OpenAI    |
+--------------------------------------------------------------------------------------+
```

### Component notes

- The diagrams should be readable in under 2 minutes.
- Keep text concise and visual.
- This page is for technical storytelling more than operation.

### Core actions

- inspect architecture layers
- compare product flow vs technical flow

## Mobile Adaptation Notes

- Sidebar becomes bottom navigation or drawer.
- Tables collapse into card lists.
- Trace page uses stacked panels instead of side-by-side panes.
- Simulator should keep controls above the comparison area on small screens.

## Recommended First Wireframe Sequence

1. Overview
2. Portfolio
3. Customer Case
4. AI Workflow Trace
5. What-If Simulator
6. Approvals
7. Evaluation
8. Optimization
9. Data Explorer
10. Architecture
11. Cases

## Note On Image Mockups

This file is a wireframe-level written spec. It is the basis for either:

- image mockups in a separate design tool
- or direct frontend implementation in Next.js/React

In this environment, the most reliable next step is to turn these wireframes into coded UI screens or more detailed layout specs.

