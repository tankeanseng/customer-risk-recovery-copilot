# Detailed UI Design Spec

This document refines the wireframe plan into a higher-fidelity written UI spec for every page in Customer Risk & Recovery Copilot.

It is intended to be the UI source of truth before visual implementation.

## Global Design Principles

The entire app should feel:

- professional and enterprise-ready
- calm and trustworthy
- AI-native without being gimmicky
- smooth, responsive, and comfortable to use
- information-dense but never chaotic
- transparent about what the AI is doing

### Interaction principles

- primary actions must always be obvious
- dense data should be progressively disclosed
- critical decisions should feel deliberate, not abrupt
- animations should communicate system state, not decorate it
- AI outputs should always be paired with evidence or traceability

### Visual principles

- light-first interface
- premium neutral background with restrained accent colors
- medium-density layouts with clear rhythm
- strong typographic hierarchy
- modular panels with subtle depth
- visible status language:
  - teal for AI/system
  - amber for review/approval
  - brick red for high risk
  - muted green for stable/recovered

### Common shell behavior

All pages share:

- left sidebar navigation
- sticky top bar
- page title and short purpose line
- optional page-level actions on the top right
- responsive layout that becomes stacked on smaller screens

## Global Shell

### Top Bar

Purpose:

- anchor the product identity
- expose global navigation helpers
- show live system presence

Must contain:

- product wordmark/title
- global search
- demo mode badge
- live status chip for active AI runs
- notifications button
- user/profile menu

Optional later:

- quick switcher for sample customer cases

### Sidebar

Purpose:

- make navigation clear and stable
- help interviewers move through the product without confusion

Must contain:

- Overview
- Portfolio
- Cases
- Simulator
- Approvals
- Traces
- Evaluation
- Optimization
- Data Explorer
- Architecture

Must also contain:

- `Recommended Demo Walkthrough` shortcut

### Shared panel rules

Every main content panel should have:

- clear title
- optional subtitle or metadata row
- one main purpose only
- action buttons aligned to top-right when relevant
- consistent loading, empty, and error states

---

# 1. Overview Page

## Purpose

This is the command-center home page. It should immediately tell the user:

- what needs attention now
- what the system has recently done
- where to start the best demo

It is the first page that must create confidence and curiosity.

## Design principle for this page

- feel like an executive operations briefing
- prioritize clarity over density
- make the product feel alive and current
- guide the user into the strongest demo path quickly

## Layout structure

1. Hero band
2. KPI strip
3. Main insight grid
4. AI system snapshot

## Detailed sections

### A. Overview Hero

What it does:

- introduces the product
- explains the current portfolio state at a glance
- gives the user the fastest path into the demo

Must contain:

- page title: `Customer Risk & Recovery Copilot`
- one-sentence subtitle
- primary CTA: `Launch Demo Walkthrough`
- secondary CTA: `Open Architecture`
- tertiary CTA: `View Portfolio`

Design notes:

- wide horizontal section
- visually strongest element on page
- should feel polished and premium, not marketing-heavy

### B. KPI Strip

What it does:

- surfaces the most important portfolio metrics

Must contain KPI cards for:

- total outstanding balance
- total overdue balance
- high-risk customers
- approvals pending
- active review runs
- average AI review time
- customers newly flagged by triage
- customers recommended for AI review

Each card must include:

- metric label
- primary value
- small trend or context note
- clickable behavior if relevant

### C. Critical Cases Panel

What it does:

- shows highest-priority accounts needing review

Must contain:

- 3-5 critical case cards or rows
- customer name
- risk level
- triage score
- overdue exposure
- one-line reason
- recommendation snippet
- triage trigger chips
- quick action buttons:
  - `Open Case`
  - `View Trace`

Design notes:

- should feel urgent but controlled
- high-risk badges should be prominent

### D. Active Runs Panel

What it does:

- shows currently running or recently completed AI workflows

Must contain:

- run id or shorthand
- customer name
- workflow status
- current node
- elapsed time
- action: `Open Trace`

### E. Pending Approvals Panel

What it does:

- shows sensitive recommendations waiting for human action

Must contain:

- customer name
- requested action
- priority
- waiting time
- action buttons:
  - `Open Approval`
  - `Open Case`

### F. Demo Walkthrough Card

What it does:

- provides the guided experience for interviewers

Must contain:

- recommended case name
- short explanation of why it is the best demo case
- ordered walkthrough steps
- button: `Start Guided Demo`

This is a core demo usability feature and should never be omitted.

### G. AI System Snapshot

What it does:

- signals technical sophistication at a glance

Must contain:

- number of MCP servers
- number of specialist agents
- latest eval pass rate
- optimization target
- model routing summary
- current triage pass timestamp

Buttons:

- `View Evaluation`
- `View Optimization`
- `View Triage Logic`

## Required states

- normal
- loading
- empty active runs
- empty approvals
- partial error fallback

## Required interactions

- open critical case
- open running trace
- launch walkthrough
- jump to approvals

---

# 2. Portfolio Page

## Purpose

This is the main operational portfolio view for customer risk prioritization.

## Design principle for this page

- feel like a professional risk-monitoring workspace
- highly scannable
- table-first, but supported by meaningful charts
- easy to move from portfolio-level insight into action

## Layout structure

1. Portfolio header
2. Filter bar
3. KPI row
4. Main table plus alerts rail
5. Supporting charts row

## Detailed sections

### A. Portfolio Header

Must contain:

- page title
- short description
- search box
- quick actions:
  - `Refresh Portfolio`
  - `Open Demo Case`

Optional later:

- `Export Portfolio Snapshot`

### B. Filters Bar

What it does:

- lets users narrow the portfolio quickly

Must contain:

- region dropdown
- segment dropdown
- risk level multi-select
- approval status dropdown
- strategic accounts toggle
- overdue range selector
- reset filters button

Design notes:

- filters should stay sticky when table scrolls
- controls should be compact and enterprise-friendly

### C. KPI Row

Must contain:

- exposure
- overdue exposure
- high-risk count
- approval needed count
- triage-flagged count
- AI-review recommended count

Each KPI card should support click-to-filter behavior where useful.

### D. Customer Risk Table

This is the dominant component on the page.

Columns must include:

- customer name
- segment
- region
- triage score
- risk band
- outstanding balance
- overdue balance
- oldest overdue days
- risk level
- trigger reasons summary
- recommendation summary
- approval required
- latest run status
- last reviewed
- actions

Row actions must include:

- `Open Case`
- `Run Review`
- `Compare`
- `Pin To Simulator`
- `Why Flagged`

Behavior:

- sortable columns
- sticky header
- row hover affordance
- selected rows for compare mode

### E. Alerts Rail

What it does:

- highlights notable portfolio items

Must contain:

- urgent exposure alerts
- policy threshold alerts
- simulator-recommended cases
- recently escalated cases
- newly flagged by triage

Buttons:

- `Open`
- `Run`

### F. Portfolio Charts Row

Must contain:

- risk distribution chart
- overdue exposure by segment chart
- recent risk movement chart

Purpose:

- support the table with broader context
- help interviewers see that this is more than a single-case app

## Required states

- default loaded
- filtered
- search no results
- loading
- table empty state

## Required interactions

- filter and search
- sort table
- multi-select compare
- open case
- trigger review

---

# 3. Customer Case Page

## Purpose

This is the heart of the product: the investigation workspace where the AI’s business usefulness becomes obvious.

## Design principle for this page

- feel like a premium investigation cockpit
- center the recommendation without hiding the evidence
- balance business readability and technical credibility
- make every key conclusion explainable

## Layout structure

1. Customer header
2. Action bar
3. Risk snapshot strip
4. Main analysis grid
5. Notes timeline
6. Evidence panel
7. Disputes panel

## Detailed sections

### A. Customer Header

Must contain:

- customer name
- segment
- region
- relationship duration
- payment terms
- credit limit
- account owner
- strategic badge
- customer tier

Buttons:

- `Back To Portfolio`
- `Open In Cases`

### B. Action Bar

Must contain:

- `Run AI Review`
- `Rerun Review`
- `Open Simulator`
- `View Full Trace`
- `Submit For Approval`
- `Export Brief`

Behavior:

- disable actions when unavailable
- show progress state during review run

### C. Risk Snapshot Strip

Must contain:

- risk level badge
- risk score
- triage score
- risk band label
- overdue amount
- oldest overdue days
- payment deterioration score
- relationship health
- approval state

This strip should be immediately understandable with color-coded status.

It must also clearly distinguish:

- portfolio triage score
- deeper AI review result

### D. Financial Signals Panel

Must contain:

- invoice aging chart
- payment timeliness chart
- order trend chart
- partial payment timeline

Purpose:

- explain the financial pattern clearly
- show trend over time, not just latest numbers

### E. AI Recommendation Panel

This is one of the most important page components.

Must contain:

- latest recommendation title
- short action statement
- reasoning summary
- why now
- business tradeoff explanation
- next steps list
- confidence or caution note

Buttons:

- `View Trace`
- `View Policy Check`
- `View Triage Inputs`

### F. Risk Drivers Panel

Must contain:

- ordered driver list
- severity chip
- short explanation
- clickable behavior to highlight linked evidence

Behavior:

- selecting a driver updates evidence highlighting below

### G. Policy Panel

Must contain:

- policy compliance state
- triggered rules
- approval required or not
- explanation of why

### H. Triage Provenance Panel

Must contain:

- `Flagged by portfolio triage` status
- triage score
- trigger reasons
- hard trigger hit or not
- case auto-created or manually opened
- latest baseline review timestamp

Buttons:

- `View Triage Logic`
- `Run Live AI Review`

### I. Notes Timeline

Must contain:

- note cards with:
  - date
  - note type
  - author role
  - sentiment
  - summary
  - promise-to-pay flag
- filters:
  - all
  - finance
  - account manager
  - promise to pay
  - dispute

Purpose:

- show qualitative business context
- prove the AI uses more than numeric thresholds

### J. Evidence Panel

Must contain grouped evidence tabs:

- invoices
- payments
- orders
- notes
- policy evidence

Must support:

- highlighting records linked to the selected risk driver
- badge for `Used In Recommendation`
- jump links to Data Explorer or Trace

### K. Disputes Panel

Must contain:

- dispute list
- amount
- type
- status
- opened date
- resolution summary

## Required states

- no run yet
- latest run completed
- run in progress
- awaiting approval
- evidence highlighted
- baseline triage only with no live rerun yet

## Required interactions

- run or rerun review
- select risk driver
- inspect evidence
- open simulator
- submit for approval
- export brief

---

# 4. AI Workflow Trace Page

## Purpose

This page proves the AI system is real, structured, and advanced.

## Design principle for this page

- technical but readable
- clean and inspectable
- never dump raw logs without hierarchy
- make the workflow graph the visual anchor

## Layout structure

1. Run header
2. Graph and timeline row
3. Tool calls and structured outputs row
4. Routing and event panels row

## Detailed sections

### A. Run Header

Must contain:

- run id
- customer name
- run status
- duration
- estimated cost
- start/end time
- approval interrupt indicator

Buttons:

- `Replay Run`
- `Compare Run`
- `Back To Case`

### B. Workflow Graph Panel

Must contain nodes:

- Case Intake Agent
- Financial Risk Agent
- Relationship Agent
- Policy Check Agent
- Recovery Strategy Agent
- Approval Router

Behavior:

- clicking a node updates the rest of the page
- node states:
  - queued
  - running
  - completed
  - failed
  - paused

### C. Run Timeline Panel

Must contain:

- node order
- duration
- status
- model used

Purpose:

- provide simple chronological interpretation

### D. Tool Calls Panel

Must contain:

- MCP server
- tool name
- invoking node
- latency
- input summary
- output summary

Buttons:

- `View Request Detail`
- `View Response Detail`

### E. Structured Outputs Panel

Must contain rendered views for:

- intake plan
- financial risk assessment
- relationship assessment
- recommendation
- policy check

Do not show raw JSON first. Show polished structured cards with optional raw toggle.

### F. Model Routing Panel

Must contain:

- node -> model mapping
- provider
- route reason
- fallback used or not

Purpose:

- show LiteLLM routing sophistication clearly

### G. Events Panel

Must contain:

- run started
- node completed
- approval paused
- approval resumed
- run completed

## Required states

- running live
- completed
- failed
- paused for approval

## Required interactions

- select node
- inspect tool call
- inspect structured output
- compare runs

---

# 5. What-If Simulator Page

## Purpose

This page makes the product feel interactive and intelligent rather than static.

## Design principle for this page

- smooth and exploratory
- easy enough for non-technical interviewers
- powerful enough to feel like a decision lab
- emphasize deltas over raw numbers

## Layout structure

1. Simulator header
2. 3-column main workspace
3. preset strip
4. saved scenario history

## Detailed sections

### A. Simulator Header

Must contain:

- customer name
- baseline risk level
- baseline triage score
- baseline recommendation

Buttons:

- `Run Simulation`
- `Reset To Baseline`
- `Save Scenario`
- `Open Simulation Trace`

### B. Scenario Controls Panel

Controls must be grouped clearly.

#### Payment Stress group

- overdue days slider
- outstanding balance slider
- partial payment amount input
- broken promises stepper

#### Relationship group

- order trend segmented control
- strategic account toggle
- account manager confidence slider

#### Operational group

- dispute status dropdown
- payment terms dropdown
- credit limit slider

Purpose:

- make scenario editing feel friendly and tactile

### C. Before vs After Panel

Must contain:

- baseline risk card
- simulated risk card
- baseline triage card
- simulated triage card
- baseline action card
- simulated action card
- approval before/after
- top changed drivers

Must visually emphasize:

- severity changes
- threshold crossing
- action escalation or de-escalation

### D. Impact Explanation Panel

Must contain:

- what changed
- why the recommendation changed
- which policy rules were triggered
- which agent outputs changed most
- caution/confidence note
- whether a hard trigger was newly crossed

### E. Scenario Presets Bar

Must contain preset actions:

- `Miss Another Payment`
- `Receive Partial Payment`
- `Dispute Resolved`
- `Reduce Credit Limit`
- `Customer Recovers`

### F. Saved Scenario History

Must contain:

- scenario name
- created time
- resulting risk level
- approval required yes/no

Buttons:

- `Load`
- `Compare`
- `Delete`

## Required states

- baseline only
- running simulation
- completed simulation
- saved scenario list empty

## Required interactions

- adjust controls
- apply preset
- run simulation
- save and reload scenario

---

# 6. Cases Page

## Purpose

Manage all recovery cases as workflow objects.

## Design principle for this page

- operational queue feel
- compact and efficient
- easy to scan status and handoff state

## Layout structure

1. Header
2. status summary strip
3. queue + activity split view

## Detailed sections

### A. Cases Header

Must contain:

- title
- subtitle
- search
- `Create Case` button

### B. Status Summary Strip

Must contain cards for:

- new
- in review
- awaiting approval
- approved
- rejected
- resolved

Each card must filter the table.

### C. Case Queue Table

Must contain columns:

- case id
- customer
- region
- segment
- status
- priority
- trigger reason
- latest recommendation
- approval status
- latest run status
- updated at
- actions

Actions:

- `Open`
- `Run`
- `Trace`

### D. Activity Feed Panel

Must contain recent events:

- case created
- review run started
- run completed
- approval requested
- approved / rejected
- simulation saved

## Required states

- active queue
- filtered queue
- no matching cases

## Required interactions

- filter by status
- search
- open case
- run review

---

# 7. Approvals Page

## Purpose

Approve, reject, or revise sensitive recommendations.

## Design principle for this page

- deliberate and trustworthy
- reduce decision anxiety
- keep evidence visible near the decision controls

## Layout structure

1. header
2. split queue/detail layout

## Detailed sections

### A. Approvals Header

Must contain:

- title
- summary counts
- filters

### B. Approval Queue Table

Columns:

- customer
- requested action
- risk level
- waiting time
- priority
- status

### C. Approval Detail Panel

Must contain:

- customer summary
- requested action
- risk summary
- policy reason
- evidence snapshot
- latest recommendation
- business tradeoff

### D. Decision Form

Must contain:

- comment field
- `Approve`
- `Reject`
- `Request Revision`

Decision buttons must be large and unambiguous.

### E. Decision Audit Panel

Must contain:

- event history
- actor
- timestamp
- comments

## Required states

- no selection
- pending approval selected
- approved record selected
- rejected record selected

## Required interactions

- select queue row
- approve
- reject
- request revision
- resume workflow

---

# 8. Evaluation Page

## Purpose

Make quality measurement visible and credible.

## Design principle for this page

- analytical
- calm
- test-lab feeling
- emphasize trust and rigor

## Layout structure

1. header
2. KPI strip
3. scenario table + failure analysis
4. version comparison

## Detailed sections

### A. Evaluation Header

Must contain:

- title
- last eval run info
- button: `Run Evaluation Suite`

### B. KPI Strip

Must contain:

- tool selection accuracy
- recommendation pass rate
- policy compliance rate
- schema validity
- approval routing correctness
- average latency

### C. Scenario Table

Columns:

- scenario id
- case name
- expected action band
- actual result
- status
- trace link

### D. Failure Analysis Panel

Must contain:

- selected failed case
- expected vs actual
- likely cause
- linked trace button

### E. Version Comparison Panel

Must contain:

- baseline score
- optimized score
- delta
- trend or bar chart

Buttons:

- `Open Optimization`

## Required states

- latest eval loaded
- evaluation running
- no failures
- failures available

## Required interactions

- run eval suite
- select failure
- open trace
- compare versions

---

# 9. Optimization Page

## Purpose

Show how the AI program was improved using DSPy.

## Design principle for this page

- feel like an experimentation studio
- communicate rigor simply
- clearly show why the optimized version is better

## Layout structure

1. header
2. summary card
3. comparison + metrics row
4. history + sample output row

## Detailed sections

### A. Optimization Header

Must contain:

- title
- optimized target task
- button: `View Evaluation Impact`

### B. Summary Card

Must contain:

- optimization framework
- baseline version
- optimized version
- baseline score
- optimized score
- improvement delta

### C. Baseline vs Optimized Panel

Must contain:

- side-by-side recommendation output
- side-by-side reasoning summary
- key differences callout

### D. Optimization Metrics Panel

Must contain:

- score chart
- candidate count
- best run marker

### E. Experiment History Table

Columns:

- run id
- target task
- baseline
- best score
- candidate count
- completed at

### F. Sample Output Comparison Panel

Must contain:

- selected sample case
- baseline output
- optimized output
- explanation of quality improvement

## Required states

- data loaded
- no optimization run yet
- loading comparison

## Required interactions

- inspect experiment run
- switch sample case
- compare outputs

---

# 10. Data Explorer Page

## Purpose

Make the dataset feel transparent and believable.

## Design principle for this page

- structured and inspectable
- avoid raw admin-tool feeling
- help users trust the built-in demo data

## Layout structure

1. header
2. summary strip
3. domain tabs
4. records table + detail drawer

## Detailed sections

### A. Data Explorer Header

Must contain:

- title
- subtitle
- search field

### B. Data Summary Strip

Cards:

- customers
- invoices
- payments
- orders
- notes
- disputes
- policies

Each card switches the selected domain.

### C. Domain Tabs

Tabs:

- customers
- invoices
- payments
- orders
- notes
- disputes
- policies

### D. Records Table

Dynamic table based on active tab.

Must support:

- sorting
- search
- row selection
- optional filters

### E. Record Detail Drawer

Must contain:

- full record details
- linked customer
- linked case ids
- linked run ids
- `Used In Latest AI Review` badge when applicable

Buttons:

- `Open Case`
- `Open Trace`

## Required states

- default domain loaded
- searched list
- no matches
- record detail open

## Required interactions

- switch domain
- search
- inspect record detail
- jump to linked case or run

---

# 11. Architecture Page

## Purpose

Help technical reviewers understand the system quickly.

## Design principle for this page

- clean technical storytelling
- visual first, text second
- separate product flow from technical architecture

## Layout structure

1. hero
2. product flow diagram
3. technical architecture diagram
4. topology panels

## Detailed sections

### A. Architecture Hero

Must contain:

- title
- one-paragraph explanation
- quick bullets:
  - LangGraph
  - MCP
  - LiteLLM
  - OpenAI
  - evals
  - optimization

### B. Product Flow Diagram

Must show:

- portfolio monitoring
- case review
- AI workflow
- recommendation
- approval
- simulation
- evaluation

### C. Technical Architecture Diagram

Must show:

- Next.js frontend
- CloudFront
- API Gateway
- Lambda/FastAPI
- LangGraph
- LiteLLM
- OpenAI API
- MCP servers
- traces/evals

### D. MCP Topology Panel

Must list:

- customer-profile-mcp
- ar-analytics-mcp
- notes-policy-mcp
- case-actions-mcp

### E. Specialist Agents Panel

Must list:

- Case Intake Agent
- Financial Risk Agent
- Relationship Agent
- Policy Check Agent
- Recovery Strategy Agent

### F. Deployment Topology Panel

Must show:

- frontend hosting
- API path
- state/persistence layer
- AI layer

## Required states

- default loaded
- diagram hover/detail expansion if implemented later

## Required interactions

- inspect architecture blocks
- compare product flow vs technical flow

---

# Cross-Page UX Requirements

## Required cross-page links

- Overview -> Portfolio
- Overview -> featured case
- Portfolio -> Customer Case
- Customer Case -> Trace
- Customer Case -> Simulator
- Customer Case -> Approval
- Trace -> Customer Case
- Evaluation -> Trace
- Optimization -> Evaluation
- Data Explorer -> Customer Case
- Data Explorer -> Trace

## Required shared patterns

- loading skeletons
- empty states
- error states with retry
- drawers for details
- badges for risk, approval, and workflow state
- chips for triage trigger reasons
- baseline-vs-live review badges
- consistent button hierarchy:
  - primary
  - secondary
  - tertiary
  - danger

## Required button taxonomy

Primary examples:

- Run AI Review
- Run Simulation
- Approve

Secondary examples:

- Open Simulator
- View Trace
- Export Brief

Danger examples:

- Reject
- Pause Credit Orders

---

# Recommended Next Step After This Spec

1. turn these page specs into implementation-ready visual wireframes
2. create the frontend app shell and routing
3. build the pages in this order:
   - Overview
   - Portfolio
   - Customer Case
   - AI Workflow Trace
   - What-If Simulator
   - Approvals
   - Evaluation
   - Optimization
   - Data Explorer
   - Architecture
   - Cases
