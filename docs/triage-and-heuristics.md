# Triage And Heuristics

This document defines the exact portfolio triage layer for Customer Risk & Recovery Copilot.

The triage layer is the low-cost front door of the system. It should:

- scan the whole portfolio cheaply
- flag customers worth attention
- explain why they were flagged
- decide whether deeper AI review is needed
- avoid wasting LLM cost on clearly healthy accounts

## Design Goals

The triage model should be:

- realistic for production use
- simple enough to explain in interviews
- deterministic and cheap
- good enough to surface meaningful cases
- consistent with the later AI review workflow

It should not try to replace the deeper agentic review.

## Two-Layer Decision Model

### Layer 1: Triage

Cheap scoring over all customers using structured business signals.

Outputs:

- triage score
- risk band
- trigger reasons
- whether AI review is recommended
- whether a recovery case should be created automatically

### Layer 2: AI Review

Run only for:

- high-score customers
- customers hitting hard triggers
- ambiguous strategic customers
- manually opened cases
- what-if simulations

## Inputs To The Triage Layer

All inputs should be available without expensive LLM reasoning.

### Financial stress signals

- overdue balance
- overdue balance as a percentage of credit limit
- oldest overdue invoice days
- number of overdue invoices
- number of invoices > 30 days overdue
- number of invoices > 60 days overdue
- recent partial payment behavior

### Behavioral signals

- number of late payments in recent period
- number of broken promise-to-pay notes
- repeated deferral requests

### Commercial signals

- 90-day order decline percentage
- order frequency decline
- account strategic flag
- account tenure

### Operational signals

- active dispute count
- overdue balance tied to active disputes

## Final Triage Score

Use a `0-100` score.

The score should come from four weighted buckets.

### 1. Exposure And Aging Score (0-40)

Measures how severe the current receivable stress is.

Sub-rules:

- overdue balance / credit limit >= 0.80 -> +16
- overdue balance / credit limit 0.50 to 0.79 -> +10
- overdue balance / credit limit 0.25 to 0.49 -> +6

- oldest overdue >= 60 days -> +14
- oldest overdue 45 to 59 days -> +10
- oldest overdue 30 to 44 days -> +6
- oldest overdue 15 to 29 days -> +3

- 2 or more invoices > 30 days overdue -> +6
- 1 invoice > 30 days overdue -> +3

Cap this bucket at `40`.

### 2. Payment Behavior Score (0-25)

Measures pattern deterioration rather than just exposure amount.

Sub-rules:

- broken promises in last 60 days >= 2 -> +10
- broken promises in last 60 days = 1 -> +5

- late payment count in last 90 days >= 4 -> +8
- late payment count in last 90 days 2 to 3 -> +5

- two or more recent partial payments on overdue invoices -> +5
- one recent partial payment on overdue invoices -> +2

- repeated request for payment extension -> +2

Cap this bucket at `25`.

### 3. Relationship And Revenue Signal Score (0-20)

Measures whether the customer relationship is weakening at the same time.

Sub-rules:

- 90-day order value decline >= 30% -> +10
- 90-day order value decline 15% to 29% -> +6
- 90-day order value decline 5% to 14% -> +3

- order frequency decline >= 25% -> +5
- order frequency decline 10% to 24% -> +3

- account manager confidence <= 40 -> +5
- account manager confidence 41 to 60 -> +2

Cap this bucket at `20`.

### 4. Context And Exception Score (0-15)

Captures contextual cases that need review even if pure numeric stress is not extreme.

Sub-rules:

- new customer under 6 months with any invoice >= 30 days overdue -> +8
- active dispute tied to overdue invoices -> +4
- strategic account with worsening payment trend -> +5
- negative collections/contact quality indicator -> +3

Cap this bucket at `15`.

## Risk Bands

After summing the weighted buckets:

- `0-24`: Low
- `25-44`: Monitor
- `45-64`: Watchlist
- `65-79`: High
- `80-100`: Critical

## Meaning Of Each Band

### Low (0-24)

- no case created automatically
- no AI review by default
- visible in portfolio as healthy or low concern

### Monitor (25-44)

- visible in portfolio watch section
- no automatic AI review unless recent upward movement or manual request

### Watchlist (45-64)

- create or update watchlist case
- AI review recommended, but can be deferred if already recently reviewed

### High (65-79)

- auto-create or auto-refresh recovery case
- AI review strongly recommended
- surface prominently in dashboard

### Critical (80-100)

- create or refresh case immediately
- prioritize AI review
- likely approval-sensitive or policy-triggering path

## Hard Triggers

These should override normal score behavior and force immediate attention.

If any hard trigger is true, the account should be flagged for AI review even if the computed score is lower.

### Hard trigger rules

- any invoice > 60 days overdue
- overdue balance > 80% of credit limit
- 2 or more broken promises in last 60 days
- new customer under 6 months with any invoice > 30 days overdue
- strategic account with both rising overdue trend and order decline
- active policy threshold breach for restrictive action

## Soft Modifiers

These do not force AI review on their own, but adjust urgency or explanation.

### Positive/mitigating modifiers

- recent meaningful partial payment received
- dispute explains most of the overdue amount
- recent recovery in order trend
- recent payment timeliness improvement

These should lower urgency or appear as context in the trigger explanation, but not fully erase the score unless clearly justified.

## Final Triage Output Object

Every customer row should have a triage result object like:

```json
{
  "triage_score": 64,
  "risk_band": "watchlist",
  "trigger_reasons": [
    "Oldest overdue invoice crossed 30 days",
    "Recent partial payment behavior suggests stress",
    "Order trend declined over last 90 days"
  ],
  "hard_trigger_hit": false,
  "ai_review_recommended": true,
  "auto_case_create": true,
  "urgency_level": "medium"
}
```

## AI Review Recommendation Logic

### AI review should be triggered when:

- score >= 45 and last AI review is stale
- any hard trigger is hit
- user manually opens or reruns a case
- a simulation is launched
- approval decision requires resumption or revised reasoning

### AI review can be skipped when:

- score < 45
- no hard triggers
- customer was reviewed recently and nothing meaningful changed

## "Last Review Is Stale" Rule

For the demo, use a simple rule:

- if last AI review is older than 7 days for watchlist/high/critical customers -> rerun recommended

This helps the portfolio feel dynamic without needing constant background AI runs.

## UI Representation

The heuristic layer should be visible. It must not feel hidden.

Users should understand that:

- the whole portfolio was triaged cheaply
- the AI review is a deeper second stage

## How Triage Appears In The UI

### Overview page

Show:

- `High-risk customers` count
- `Approvals pending` count
- `Customers newly flagged today`
- `Customers requiring AI review`

Critical case cards should say:

- `Flagged by triage`
- top 1-2 trigger reasons

### Portfolio page

Each customer row should show:

- risk band badge
- triage score
- short trigger reason chips
- latest AI review timestamp

Recommended extra columns or inline chips:

- `Triage score`
- `AI review recommended`
- `Hard trigger`

Row expansion or hover detail should show:

- trigger reasons
- whether the case was auto-created
- whether the recommendation is from baseline or live AI

### Customer case page

Near the top of the page, show:

- `Flagged by portfolio triage`
- triage score
- trigger reasons
- last analyzed timestamp

This helps users understand how the case entered the AI workflow.

### AI workflow trace page

First node should be clearly named:

- `Case Intake Agent`

But metadata should also reference the upstream triage:

- triage score
- trigger reasons
- hard trigger or not

### Simulator page

Show:

- baseline triage score
- simulated score after changed conditions
- whether a hard trigger is newly crossed

This makes the simulator much more intuitive.

## Recommended Portfolio Labels

Use simple user-facing labels:

- `Healthy`
- `Monitor`
- `Watchlist`
- `High Risk`
- `Critical`

Avoid showing only raw score without interpretation.

## Demo Behavior Recommendation

For the public demo:

- all 14 sample customers already have a triage result
- only the flagged subset appear in urgent panels
- users can still browse all customers
- live AI review is only triggered when the user clicks into a flagged case and runs it

This is the best mix of:

- realism
- cost control
- usability
- visible AI sophistication

## Best Demo Cases By Triage Pattern

### Borderline watchlist

- Horizon Foodservice Trading Sdn Bhd

### High-risk escalation

- Meridian Retail Mart Sdn Bhd

### Critical approval case

- Titan Facility Management Pte Ltd

### Strategic exception case

- GreenWave Hospitality Group

### Qualitative-signal case

- Summit Lifestyle Retail Sdn Bhd

## What This Triage Layer Proves In Interviews

It shows that the product is not:

- a naive LLM-on-everything system
- a toy demo
- a hard-coded case player

It shows instead that the system is:

- production-aware
- cost-aware
- enterprise-realistic
- selective in where it spends AI reasoning
