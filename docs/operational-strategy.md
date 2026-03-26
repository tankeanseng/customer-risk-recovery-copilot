# Operational Strategy

This document explains how Customer Risk & Recovery Copilot should behave in a real production environment and how the public demo should simulate that experience without creating unnecessary API cost.

## Production principle

Do not run a full expensive AI analysis over every customer every day.

Instead, use a two-stage operating model:

1. heuristic or analytics-based triage over the whole portfolio
2. deeper AI review only for selected customers or triggered cases

## Why full AI scanning is a bad default

If a company has hundreds or thousands of customers, running a full multi-step agent workflow over every customer on every schedule would be:

- expensive
- slow
- operationally unnecessary
- wasteful for clearly healthy accounts

Most accounts on most days will not need a full reasoning workflow.

## Recommended production workflow

### Stage 1: portfolio triage

Run cheap deterministic or low-cost analytics over all customers.

Examples:

- overdue balance threshold
- oldest overdue days
- repeated late payment count
- broken promise count
- order decline percentage
- dispute count
- rapid deterioration for new accounts
- strategic account exceptions

Output:

- a risk watchlist
- cases requiring review
- accounts that remain low-risk and do not need AI analysis

The exact scoring and rule set is defined in `triage-and-heuristics.md`.

### Stage 2: AI review

Only run the full AI workflow for:

- customers newly entering the watchlist
- customers crossing policy thresholds
- accounts explicitly opened by users
- strategic or ambiguous cases where tradeoffs matter
- saved demo scenarios in the simulator

This is where LangGraph, MCP, and model reasoning are used.

## Recommended production cadence

### Cheap scheduled portfolio job

Run on a schedule such as:

- daily
- every few hours
- or event-triggered after important account changes

This job should compute:

- triage scores
- threshold breaches
- watchlist changes
- approval flags

### AI review cadence

Run the expensive AI workflow:

- on demand
- on watchlist transitions
- on policy trigger events
- on manager-requested case review

## Demo strategy

The demo should show the system as if this operating model exists, but without unnecessary ongoing API cost.

### Demo principle

Use a hybrid model:

1. preload realistic baseline portfolio and case states
2. allow selected actions to trigger live AI runs

This creates a believable experience while keeping cost under control.

## What should be precomputed in the demo

Precompute and store:

- portfolio KPIs
- default customer risk states
- latest baseline case reviews for all built-in cases
- some trace snapshots
- some evaluation summaries
- some optimization summaries

This ensures the app always loads quickly and looks alive.

## What should be live in the demo

Run live AI only for high-value interactions such as:

- `Run AI Review` on a case page
- `Rerun Review`
- `Run Simulation`
- selected approval resume paths

This gives users and interviewers the feeling that the AI is genuinely working in the backend.

## Best demo cost-control strategy

### Default state

All sample cases already have a latest review and visible outputs.

### Optional live rerun

Users can click:

- `Run AI Review`
- `Rerun Review`
- `Run Simulation`

These perform a real backend run for a single case only.

### Why this is the best tradeoff

It avoids:

- running expensive scans every page load
- paying for constant background AI runs
- making the demo slow

While still proving:

- the system can perform real live analysis
- the recommendation changes when conditions change
- the workflow trace is generated dynamically

## User experience recommendation

The UI should make this operating model visible.

Examples:

- show a badge like `Latest baseline review`
- show a button like `Run Live AI Review`
- show `Last analyzed at ...`
- show simulator runs as live recomputations

This makes it clear the app contains both:

- a realistic baseline operating state
- live AI execution on demand

## Recommended architecture for cost control

### Precomputed layer

Store in backend persistence:

- customer portfolio summaries
- case brief snapshots
- baseline traces
- evaluation snapshots

### Live execution layer

Use Lambda + OpenAI only when:

- user explicitly triggers a run
- simulation is executed
- approval-triggered rerun is needed

## Production + demo alignment

The good news is that this hybrid model is realistic in both production and the public demo.

It does not feel fake because real companies also would not run deep AI review on every account continuously.

They would use:

- rules
- analytics
- event triggers
- watchlists

to decide where to spend AI reasoning cost.

## Final recommendation

The product should be designed around:

- cheap portfolio-wide triage
- selective case-level AI review
- live AI only for high-value or user-triggered actions

This is:

- realistic
- cost-efficient
- production-credible
- demo-friendly
