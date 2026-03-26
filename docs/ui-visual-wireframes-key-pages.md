# Visual Wireframes: Key Pages

This document turns the written UI specs into implementation-ready visual wireframes for the 5 highest-priority pages:

1. Overview
2. Portfolio
3. Customer Case
4. AI Workflow Trace
5. What-If Simulator

These wireframes are still text-first, but they are precise enough to guide frontend implementation.

## Global Layout Rules

### Desktop shell

```text
+--------------------------------------------------------------------------------------------------+
| Top Bar: Logo | Product | Search | Demo Mode | Active Runs | Notifications | User Menu          |
+----------------------+---------------------------------------------------------------------------+
| Sidebar Nav          | Main Page Canvas                                                          |
|                      |                                                                           |
| Overview             |                                                                           |
| Portfolio            |                                                                           |
| Cases                |                                                                           |
| Simulator            |                                                                           |
| Approvals            |                                                                           |
| Traces               |                                                                           |
| Evaluation           |                                                                           |
| Optimization         |                                                                           |
| Data Explorer        |                                                                           |
| Architecture         |                                                                           |
|                      |                                                                           |
| Demo Walkthrough     |                                                                           |
+----------------------+---------------------------------------------------------------------------+
```

### Width guidelines

- Sidebar: `248px`
- Main canvas max width: `1440px`
- Page gutters: `24px`
- Panel gaps: `20px`
- Standard card padding: `20px`
- Dense technical tables: `14px` row padding

### Shared UI tokens

- Hero radius: `20px`
- Standard card radius: `16px`
- Inset technical panel radius: `14px`
- Primary button height: `40px`
- Secondary button height: `36px`
- KPI card min height: `104px`

### Shared badges

- Risk band badge
- Triage score pill
- Hard trigger pill
- Baseline review chip
- Live AI chip
- Approval status chip

---

# 1. Overview Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: Overview                                                                             |
| Subtitle: Daily risk briefing, active AI workflows, approvals, and demo guidance                 |
+--------------------------------------------------------------------------------------------------+
| HERO BAND                                                                                       |
| Customer Risk & Recovery Copilot                                                                 |
| AI decision support for customer risk, recovery, and approval workflows                          |
|                                                                                                  |
| [Launch Demo Walkthrough] [Open Architecture] [View Portfolio]                                   |
|                                                                                                  |
| Right side callout:                                                                              |
| - 14 active accounts tracked                                                                     |
| - 8 flagged by triage                                                                            |
| - 5 recommended for AI review                                                                    |
+--------------------------------------------------------------------------------------------------+
| KPI CARD | KPI CARD | KPI CARD | KPI CARD | KPI CARD | KPI CARD                                  |
| Outstand | Overdue  | High Risk| Approvals| Active AI| Review Time                               |
+----------------------------------------------+---------------------------------------------------+
| Critical Cases                                 | Active AI Runs                                  |
|                                                 |                                                 |
| [Case Card]                                     | [Run Row]                                        |
| [Case Card]                                     | [Run Row]                                        |
| [Case Card]                                     | [Run Row]                                        |
+----------------------------------------------+---------------------------------------------------+
| Pending Approvals                               | Demo Walkthrough                                 |
|                                                 |                                                 |
| [Approval Row]                                  | Recommended case: Horizon Foodservice            |
| [Approval Row]                                  | 1. Open case                                     |
|                                                 | 2. Run AI review                                 |
|                                                 | 3. Inspect trace                                 |
|                                                 | 4. Run simulation                                |
|                                                 | 5. Review approval                               |
|                                                 | [Start Guided Demo]                              |
+--------------------------------------------------------------------------------------------------+
| AI SYSTEM SNAPSHOT                                                                              |
| MCP servers | Specialist agents | Latest eval pass rate | Optimized task | Triage timestamp      |
| [View Evaluation] [View Optimization] [View Triage Logic]                                       |
+--------------------------------------------------------------------------------------------------+
```

## Component sizing and hierarchy

- Hero band: full width, `min-height 180px`
- KPI row: 6 equal-width cards
- Main insight grid:
  - left column `58%`
  - right column `42%`
- AI snapshot full width below

## Required content behavior

### Critical case cards

Each card must show:

- customer name
- risk band
- triage score
- top 2 trigger chips
- outstanding overdue amount
- recommendation snippet
- buttons:
  - `Open Case`
  - `View Trace`

### Active AI run rows

Each row must show:

- customer name
- run status
- current node
- elapsed time
- `Open Trace`

### Motion guidance

- KPI numbers animate in once on first page load
- active runs use subtle shimmer or pulse
- critical case cards stagger in by `50-80ms`

## Mobile wireframe

```text
+----------------------------------------------+
| Overview                                     |
| Subtitle                                     |
+----------------------------------------------+
| HERO                                         |
| Title                                        |
| Subtitle                                     |
| [Launch Demo] [Portfolio]                    |
+----------------------------------------------+
| KPI carousel or 2-column KPI grid            |
+----------------------------------------------+
| Critical Cases                               |
| [Case Card]                                  |
| [Case Card]                                  |
+----------------------------------------------+
| Active Runs                                  |
| [Run Row]                                    |
+----------------------------------------------+
| Pending Approvals                            |
| [Approval Row]                               |
+----------------------------------------------+
| Demo Walkthrough                             |
| [Start Guided Demo]                          |
+----------------------------------------------+
| AI System Snapshot                           |
+----------------------------------------------+
```

---

# 2. Portfolio Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: Portfolio                                                                            |
| Subtitle: Portfolio-wide triage and selective AI review                                          |
| Search box............................................... [Refresh] [Open Demo Case]             |
+--------------------------------------------------------------------------------------------------+
| FILTER BAR                                                                                       |
| Region v | Segment v | Risk Band v | Approval v | Strategic [toggle] | Overdue Range v | Reset  |
+--------------------------------------------------------------------------------------------------+
| KPI | KPI | KPI | KPI | KPI | KPI                                                                |
| Exposure | Overdue | High Risk | Approval Needed | Triage Flagged | AI Review Recommended       |
+-------------------------------------------------------------+------------------------------------+
| CUSTOMER RISK TABLE                                          | ALERTS RAIL                       |
|                                                               |                                    |
| Name        Segment  Region  Triage  Risk  Overdue  Actions  | Critical now                       |
| HarborCare  Office   SG      14      Low   ...      ...      | - Titan Facility Management        |
| Horizon     F&B      MY      63      Watch ...      ...      | - GreenWave Hospitality            |
| Meridian    Retail   MY      72      High  ...      ...      |                                    |
| Titan       FM       SG      88      Critical ...    ...      | Newly flagged                      |
| ...                                                           | - Horizon Foodservice              |
|                                                               | - Summit Lifestyle Retail          |
| Row expand -> trigger chips, hard trigger, last review, etc. |                                    |
|                                                               | Simulator-ready                    |
|                                                               | - Horizon Foodservice              |
+-------------------------------------------------------------+------------------------------------+
| Risk Distribution Chart | Overdue Exposure By Segment | Risk Movement Over Time                |
+--------------------------------------------------------------------------------------------------+
```

## Table design details

### Table columns

Required visible columns:

- Customer
- Segment
- Region
- Triage Score
- Risk Band
- Overdue Balance
- Oldest Overdue Days
- Trigger Summary
- Latest Recommendation
- Approval
- Review Mode
- Actions

### Row anatomy

Each row should include:

- left severity border
- customer name + small subline for account owner
- triage score pill
- risk band badge
- 1-2 trigger chips
- review mode chip:
  - `Baseline`
  - `Live`

### Row expansion

Expanded row reveals:

- full trigger reasons
- hard trigger hit or not
- auto-case create yes/no
- last baseline review timestamp
- AI review recommended yes/no

## Alerts rail detail

Three stacked modules:

### Critical Now

- top urgent cases
- each with `Open` and `Run`

### Newly Flagged

- accounts whose triage moved upward recently

### Simulation Ready

- cases suited to demoing what-if analysis

## Sizing guidance

- Table region: `76%`
- Alerts rail: `24%`
- Charts row: 3 equal cards

## Mobile wireframe

```text
+----------------------------------------------+
| Portfolio                                    |
| Search...                                    |
+----------------------------------------------+
| Filter chips row                             |
+----------------------------------------------+
| KPI grid 2x3                                 |
+----------------------------------------------+
| Alerts rail becomes stacked sections         |
+----------------------------------------------+
| Customer cards/list                          |
| Customer                                     |
| Triage: 63 Watchlist                         |
| Triggers: overdue, order decline             |
| [Open Case] [Run Review]                     |
+----------------------------------------------+
| Charts stack vertically                      |
+----------------------------------------------+
```

---

# 3. Customer Case Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: Customer Case                                                                        |
| [Back to Portfolio] [Open in Cases]                                                              |
+--------------------------------------------------------------------------------------------------+
| CUSTOMER HEADER                                                                                  |
| Horizon Foodservice Trading Sdn Bhd                                                              |
| Hospitality & F&B | Malaysia | 2 years | Net 30 | Credit Limit 110,000 | Owner: Farah N.        |
| [Strategic: No] [Tier: Core]                                                                     |
+--------------------------------------------------------------------------------------------------+
| ACTION BAR                                                                                       |
| [Run AI Review] [Rerun Review] [Open Simulator] [View Full Trace] [Submit For Approval] [Export]|
+--------------------------------------------------------------------------------------------------+
| SNAPSHOT STRIP                                                                                   |
| Risk: Watchlist | Risk Score: 64 | Triage Score: 63 | Overdue: 39,200 | Oldest: 31d | Approval |
+----------------------------------------+--------------------------------+------------------------+
| FINANCIAL SIGNALS                      | AI RECOMMENDATION              | POLICY + TRIAGE         |
|                                        |                                |                        |
| Aging chart                            | Recommended Action             | Policy Status           |
| Payment timeliness                     | Schedule monitored call        | - compliant            |
| Order trend                            |                                | - near threshold       |
| Partial payments                       | Why now                        |                        |
|                                        | Business tradeoff              | TRIAGE PROVENANCE      |
|                                        | Next steps                     | Score 63 Watchlist     |
|                                        | [View Trace] [View Policy]     | Trigger chips          |
|                                        | [View Triage Inputs]           | Baseline at 09:00      |
|                                        |                                | [View Triage Logic]    |
|                                        |                                | [Run Live AI Review]   |
+--------------------------------------------------------------------------------------------------+
| RISK DRIVERS                                                                                     |
| [Rising overdue trend] [Partial payment stress] [Order decline] [Near policy threshold]         |
+--------------------------------------------------------------------------------------------------+
| NOTES TIMELINE                                                                                   |
| Filters: All | Finance | AM | Promise to Pay | Dispute                                          |
| [Note Card] [Note Card] [Note Card]                                                              |
+--------------------------------------------------------------------------------------------------+
| EVIDENCE PANEL                                                                                   |
| Tabs: Invoices | Payments | Orders | Notes | Policy                                              |
| Selected driver highlights linked evidence                                                        |
+--------------------------------------------------------------------------------------------------+
| DISPUTES PANEL                                                                                   |
+--------------------------------------------------------------------------------------------------+
```

## Column balance

- Financial signals column: `44%`
- Recommendation column: `34%`
- Policy + triage column: `22%`

## Key visual hierarchy

1. Customer identity
2. Recommendation card
3. Snapshot strip
4. Triage provenance
5. Evidence linkage

## Recommendation card detail

The recommendation card should have visually distinct blocks:

- Action
- Why this action
- Tradeoff
- Next steps
- Confidence / caution

## Triage provenance panel detail

Must show:

- `Flagged by portfolio triage`
- triage score pill
- risk band badge
- hard trigger pill if present
- trigger chips
- case source:
  - `Auto-created`
  - or `Manual review`
- baseline review timestamp

## Risk driver interaction

Clicking a driver should:

- highlight linked records in Evidence Panel
- scroll that evidence group into view if needed
- outline related note cards if linked

## Mobile wireframe

```text
+----------------------------------------------+
| Customer Case                                |
| Horizon Foodservice...                       |
| segment | terms | owner                      |
+----------------------------------------------+
| Action buttons scroll row                    |
+----------------------------------------------+
| Snapshot strip as stacked mini cards         |
+----------------------------------------------+
| Recommendation card                          |
+----------------------------------------------+
| Triage provenance card                       |
+----------------------------------------------+
| Financial charts stacked                     |
+----------------------------------------------+
| Risk drivers chips                           |
+----------------------------------------------+
| Notes timeline                               |
+----------------------------------------------+
| Evidence tabs                                |
+----------------------------------------------+
| Disputes                                     |
+----------------------------------------------+
```

---

# 4. AI Workflow Trace Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: AI Workflow Trace                                                                    |
| Run run_20260325_1020 | Completed | 19.3s | $0.41 | Customer: Horizon Foodservice               |
| [Replay Run] [Compare Run] [Back To Case]                                                        |
+----------------------------------------------------+---------------------------------------------+
| WORKFLOW GRAPH                                     | RUN TIMELINE                                |
|                                                    | Node                Status   Duration Model |
|  Intake -> Financial -> Relationship -> Policy ->  | Intake              done     2.1s    gpt... |
|  Strategy -> Approval                              | Financial Risk      done     4.8s    gpt... |
|                                                    | Relationship        done     3.2s    gpt... |
|  [Selected node highlighted]                       | Policy Check        done     2.9s    gpt... |
+----------------------------------------------------+---------------------------------------------+
| TOOL CALLS                                         | STRUCTURED OUTPUTS                           |
| MCP Server | Tool | Node | Latency | [detail]      | Tabs: Intake | Financial | Strategy         |
| ar-analytics | get_invoice_aging ...               | Rendered cards / sections                    |
| notes-policy | get_customer_notes ...              | [Raw JSON toggle]                            |
+----------------------------------------------------+---------------------------------------------+
| MODEL ROUTING                                      | EVENTS                                       |
| Node -> Model -> Route Reason -> Fallback          | run started                                  |
|                                                    | node completed                               |
|                                                    | run completed                                |
+--------------------------------------------------------------------------------------------------+
```

## Layout ratios

- Graph: `60%`
- Timeline: `40%`
- Tool Calls: `50%`
- Structured Outputs: `50%`
- Routing: `50%`
- Events: `50%`

## Node selection behavior

Selecting a node updates:

- tool call rows filtered to that node
- structured output tab focused to that node
- model routing row highlighted
- event list filtered or highlighted where relevant

## Technical readability rules

- default to human-readable summaries first
- hide raw JSON until requested
- long tool input/output should open in drawer or modal

## Mobile wireframe

```text
+----------------------------------------------+
| AI Workflow Trace                            |
| run id | status | duration                   |
+----------------------------------------------+
| Workflow graph (stacked or horizontal scroll)|
+----------------------------------------------+
| Timeline list                                |
+----------------------------------------------+
| Structured outputs tabs                      |
+----------------------------------------------+
| Tool calls                                   |
+----------------------------------------------+
| Model routing                                |
+----------------------------------------------+
| Events                                       |
+----------------------------------------------+
```

---

# 5. What-If Simulator Page

## Desktop wireframe

```text
+--------------------------------------------------------------------------------------------------+
| PAGE TITLE: What-If Simulator                                                                    |
| Horizon Foodservice | Baseline Watchlist 63 | Baseline Action: Monitored recovery call           |
| [Run Simulation] [Reset To Baseline] [Save Scenario] [Open Simulation Trace]                     |
+--------------------------------------+--------------------------------+--------------------------+
| SCENARIO CONTROLS                    | BEFORE VS AFTER                | IMPACT EXPLANATION       |
|                                      |                                |                          |
| Payment Stress                       | Baseline Triage 63             | What changed             |
| - overdue days slider                | Simulated Triage 78            | Why action changed       |
| - balance slider                     |                                | New policy threshold     |
| - partial payment input              | Baseline Action                | Affected agents          |
| - broken promises stepper            | Simulated Action               | Hard trigger crossed?    |
|                                      |                                |                          |
| Relationship                         | Approval before / after        | Confidence note          |
| - order trend segmented              | Changed drivers                |                          |
| - strategic toggle                   | - overdue threshold crossed    |                          |
| - AM confidence slider               | - order decline worsened       |                          |
|                                      | - approval now required        |                          |
| Operational                          |                                |                          |
| - dispute status dropdown            |                                |                          |
| - terms dropdown                     |                                |                          |
| - credit limit slider                |                                |                          |
+--------------------------------------------------------------------------------------------------+
| PRESETS: [Miss Another Payment] [Receive Partial Payment] [Dispute Resolved] [Reduce Credit]    |
+--------------------------------------------------------------------------------------------------+
| SAVED SCENARIOS                                                                                    |
| Scenario name | created | resulting risk | approval | actions                                     |
+--------------------------------------------------------------------------------------------------+
```

## Layout ratios

- Controls: `32%`
- Before/After: `40%`
- Explanation: `28%`

## Controls panel implementation notes

Each control group should have:

- title
- helper text
- 8-12px gap between controls
- value label always visible

### Recommended widgets

- slider with inline number field for amounts
- segmented controls for discrete trends
- dropdown for dispute status
- toggle for strategic account
- stepper for broken promises

## Before/After comparison detail

Must show these as distinct cards:

- baseline triage card
- simulated triage card
- baseline action card
- simulated action card
- approval state delta card

The delta area should be the focal point.

## Impact explanation detail

Should be written in business-readable language:

- one summary sentence
- ranked changed drivers
- triggered rules
- if applicable: `This simulation newly crosses a hard trigger`

## Mobile wireframe

```text
+----------------------------------------------+
| What-If Simulator                            |
| Baseline triage + action                     |
+----------------------------------------------+
| Scenario controls                            |
| grouped accordion or stacked cards           |
+----------------------------------------------+
| Presets row                                  |
+----------------------------------------------+
| Before vs After cards                        |
+----------------------------------------------+
| Impact explanation                           |
+----------------------------------------------+
| Saved scenarios                              |
+----------------------------------------------+
```

---

## Consistency Check Before Implementation

Before building these 5 pages, verify:

- triage score appears consistently on Overview, Portfolio, Customer Case, and Simulator
- recommendation language matches action taxonomy from the product spec
- baseline/live review state is visible wherever relevant
- all `Run` or `Review` buttons clearly imply live backend AI execution
- all pages provide a path into deeper technical transparency:
  - case -> trace
  - simulator -> trace
  - overview -> architecture / eval / optimization

## Recommended Next Step After These Wireframes

1. scaffold the frontend shell and shared layout
2. implement these 5 pages with realistic mock data and static interactions
3. connect them to the agreed API contracts
4. then build the remaining pages:
   - Approvals
   - Evaluation
   - Optimization
   - Data Explorer
   - Architecture
   - Cases

