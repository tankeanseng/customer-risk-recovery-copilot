# UI Visual Refinement

This document refines the page specs into more implementation-ready visual layout rules.

It focuses on:

- layout proportions
- hierarchy
- surface treatment
- animation behavior
- component prominence
- how to make the triage layer visibly first-class

## Cross-System Visual Rules

### Surface hierarchy

Use three levels of surfaces:

- `Level 0`: page background
- `Level 1`: primary cards and work panels
- `Level 2`: inset technical panels, drawers, comparison modules

Visual treatment:

- Level 0: warm light background
- Level 1: soft white cards with light borders
- Level 2: slightly cooler inset surfaces for trace/technical detail

### Corner and spacing rules

- container radius: medium
- inner card radius: slightly smaller
- generous vertical spacing between sections
- denser spacing inside technical tables

### Status language

- Low / healthy: muted green
- Monitor / watch: amber
- High: orange-red
- Critical: brick red
- AI / system / trace: teal
- Baseline / precomputed: slate outline chip
- Live AI run: teal filled chip

### Triage chips

Trigger reason chips should:

- be compact
- use low-emphasis filled pills
- truncate cleanly
- expand on hover or click

Examples:

- `30+ days overdue`
- `Broken promises`
- `Order decline`
- `Policy threshold`
- `Dispute-linked`

## 1. Overview Page Refinement

### Layout proportions

- Hero: full width
- KPI strip: 6 cards in one row on wide desktop
- Main insight grid: 2x2
- AI snapshot: full width secondary row

### Visual hierarchy

- Hero should be the strongest visual band
- Demo walkthrough card should be second most prominent
- Critical cases should outrank active runs visually

### Prominent badges

- `Flagged by triage`
- `AI review recommended`
- `Approval pending`

### Motion

- KPI numbers count up subtly
- active runs pulse lightly, not aggressively
- critical cases animate in with staggered reveal on first load

## 2. Portfolio Page Refinement

### Layout proportions

- Header and filters: full width
- KPI row: full width
- Main content: 75% table, 25% alerts rail
- Charts row: 3 equal charts

### Table design refinement

Use dense but breathable rows with:

- customer name as strongest text
- triage score + risk band stacked or side-by-side
- trigger chips under risk column or in a dedicated compact column
- recommendation summary muted but readable

### Important row visual signals

- left border severity marker by risk band
- `Live review available` chip when user can rerun
- `Baseline review` chip when showing precomputed state

### Expanded row content

Optional expandable row should show:

- triage trigger reasons
- last review time
- whether hard trigger hit
- case auto-created or manual

### Alerts rail refinement

The alerts rail should be grouped:

- `Critical now`
- `Newly flagged`
- `Simulation-ready`

## 3. Customer Case Page Refinement

### Layout proportions

Desktop:

- top header and action bar full width
- risk strip full width
- main analysis area:
  - left 45% financial signals
  - center 35% recommendation and risk drivers
  - right 20% policy and triage provenance
- bottom rows full width for notes, evidence, disputes

### Visual emphasis

The recommendation card must be the visual star of the central column.

The triage provenance panel must sit near policy so users understand:

- why the case surfaced
- how the deeper AI review differs from triage

### Recommendation card treatment

Must visually separate:

- `Recommended Action`
- `Why This Action`
- `Business Tradeoff`
- `Next Steps`

### Triage provenance treatment

This panel should display:

- triage score badge
- risk band badge
- hard trigger flag if present
- trigger chips
- baseline review timestamp
- `Run Live AI Review` CTA

### Evidence interaction refinement

When a risk driver is selected:

- linked records glow or highlight softly
- all unrelated records visually de-emphasize

## 4. AI Workflow Trace Page Refinement

### Layout proportions

- top header full width
- graph + timeline split 60/40
- tool calls + structured outputs split 50/50
- routing + events split 50/50

### Visual differentiation

This page can use slightly cooler surfaces and denser typography than business pages.

### Graph behavior

- node selection should visibly update side panels
- completed nodes in teal-outline or teal-fill accents
- paused nodes in amber
- failed nodes in brick red

### Structured outputs presentation

Default view should be polished cards, not raw JSON.
Raw JSON should be available behind a toggle.

## 5. What-If Simulator Page Refinement

### Layout proportions

- header full width
- 3-column body:
  - controls 32%
  - before/after comparison 40%
  - explanation 28%
- presets strip below
- saved scenarios below that

### Controls visual language

Controls should feel tactile:

- sliders with labeled min/max anchors
- segmented pills for discrete trend states
- toggles for yes/no business attributes
- input helper text below controls

### Comparison panel emphasis

The before/after action cards should be large and highly legible.

Critical refinements:

- arrows or delta markers between baseline and simulated state
- approval state should become very obvious when it flips
- changed drivers should be shown as ranked pills or stacked cards

### Explanation panel refinement

Should read like a short analyst note, not just a raw machine summary.

## 6. Cases Page Refinement

### Layout proportions

- status strip full width
- main body 70% queue, 30% activity feed

### Visual hierarchy

- queue table primary
- activity feed secondary but visibly alive

### Row states

- awaiting approval rows should show amber accent
- resolved rows should de-emphasize slightly

## 7. Approvals Page Refinement

### Layout proportions

- header full width
- queue/detail split 45/55

### Detail panel emphasis

Decision form should sit above audit trail and remain sticky while scrolling long evidence sections.

### Decision buttons

- Approve: primary
- Reject: danger
- Request Revision: secondary

These should not be visually equal in weight.

## 8. Evaluation Page Refinement

### Layout proportions

- KPI strip full width
- main body 65% scenario table, 35% failure panel
- version comparison full width

### Visual hierarchy

- KPI strip first
- failures only visually dominate when a failed row is selected

### Pass/fail treatment

- pass rows should not be too bright
- failures should be easy to locate but not alarming in a chaotic way

## 9. Optimization Page Refinement

### Layout proportions

- summary full width
- baseline vs optimized 55%, metrics 45%
- history 50%, sample comparison 50%

### Visual hierarchy

- the quality delta should be a hero metric
- sample comparison must be more prominent than experiment history

## 10. Data Explorer Page Refinement

### Layout proportions

- summary cards full width
- domain tabs full width
- main body 70% table, 30% detail drawer/panel

### Visual treatment

- should look like an evidence browser, not a raw admin console
- muted record rows
- stronger highlight for records linked to active case/run

## 11. Architecture Page Refinement

### Layout proportions

- hero full width
- product flow full width
- technical architecture full width
- topology row split 50/50
- deployment panel full width

### Visual treatment

- diagrams should use consistent iconography and edge styles
- MCP servers should appear as a coherent cluster
- product flow should feel business-readable
- technical flow should feel engineering-credible

## Cross-Page Consistency Checks

Before coding, verify:

- triage score is shown consistently on Overview, Portfolio, Customer Case, and Simulator
- baseline vs live review state is clearly visible
- all severe actions expose approval state clearly
- users can always navigate from a business page to a technical explanation page
- no page hides the reason why an account was flagged

