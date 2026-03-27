# Completion Checklist

This file is the implementation-truth checklist for the current codebase.

It is based on an actual code scan of:

- `frontend/app`
- `backend/app`
- current docs and eval scripts

Use this as the running checklist so we do not miss pages, workflows, or integrations as the project grows.

## Current Status Summary

### Meaningfully implemented pages

- `Overview`
- `Portfolio`
- `Cases`
- `Customer Case`
- `Simulator`
- `Approvals`
- `Trace`

### Real AI integration currently present

- live `Run AI Review` on the customer case page
- LiteLLM-backed OpenAI call
- structured output validation with Pydantic
- LangSmith tracing for the live case-review workflow
- first LangGraph case-review workflow (`intake -> review -> policy`)
- model evaluation harness for case review

### Major platform pieces not yet implemented

- MCP server/tool integration
- AI-powered simulator
- guided walkthrough across the full app
- deployment packaging for CloudFront + Lambda
- S3-backed data loading and persistence strategy
- deeper multi-agent LangGraph orchestration beyond the first workflow slice

## Priority 0: Must Finish Before Demo Story Is Complete

These are the highest-priority remaining items because they affect the credibility of the product story.

### 1. Real Trace Experience

Status:

- page exists at `/traces`
- LangSmith tracing exists for live case review
- latest live case-review trace can now be loaded by case
- compare and replay now work for live run ids
- live case review now returns a real LangSmith-backed `run_id` when available
- recent run history by case is now available
- evaluation rows now partially link to real trace ids when matching live case traces exist
- first LangGraph workflow steps now appear in live traces:
  - `Intake Node`
  - `Review Node`
  - `Policy Node`
  - `Model Call`
- UI still falls back to demo data when no live trace is available

Remaining work:

- support richer run history instead of only latest-by-case
- expose explicit live trace/run identifiers more widely across the app
- add deeper LangSmith metadata display in the trace page
- show richer timeline detail as more workflow steps exist
- later replace placeholder MCP section with real MCP tool-call traces

Dependencies:

- LangSmith
- current `live_case_review` metadata

### 2. Guided Demo Walkthrough

Status:

- planned in docs only
- not implemented

Remaining work:

- define the final guided path across all major pages
- add walkthrough entry points on Overview and Portfolio
- create contextual walkthrough hints for:
  - triage
  - case review
  - live AI review
  - trace
  - simulator
  - approvals
  - evaluation
  - architecture
- ensure walkthrough never routes users into unfinished or confusing flows
- include a LangSmith explanation step after users have seen a live case review

Dependencies:

- all major pages must be implemented enough to feel coherent

### 3. Complete Demo Readiness QA

Status:

- slice-by-slice testing exists
- no final full-app acceptance pass yet

Remaining work:

- create a final demo acceptance checklist
- test all nav paths from Overview
- test all major buttons and action feedback states
- test happy path walkthrough end to end
- test fallback behavior when live AI fails
- test static export and clean-route deployment assumptions

## Priority 1: Core Product Functionality Still Missing

### 4. Evaluation Page

Frontend status:

- implemented with real saved-eval data loading
- includes KPI strip, scenario table, failure analysis, and version comparison

Backend status:

- eval script exists at `backend/scripts/evaluate_case_review.py`
- eval dataset exists at `backend/app/data/eval_cases.py`
- eval result JSON files exist
- summary, scenario, run-detail, and refresh endpoints are implemented

Remaining work:

- add richer repeatability-specific UI views
- link scenarios to real traces when trace identifiers are available
- later support paid/live eval reruns behind an explicit advanced action
- later connect eval runs to LangSmith traces directly

Dependencies:

- existing eval harness
- LangSmith linkage later

### 5. Data Explorer Page

Frontend status:

- implemented with real domain tabs, records table, search, and detail drawer

Backend status:

- summary, domain-list, and record-detail endpoints are implemented

Remaining work:

- expand dataset depth so more domains feel portfolio-scale
- add domain-specific filtering beyond free-text search
- mark records more explicitly as `Used In Latest AI Review`
- later connect record-level trace links to real trace ids instead of only latest run ids
- later expose richer cross-record relationship browsing

Dependencies:

- demo data model
- later MCP/data lineage story

### 6. Architecture Page

Frontend status:

- implemented with product flow, technical architecture, MCP topology, agent list, and deployment topology

Backend status:

- architecture endpoint is implemented

Remaining work:

- evolve the page as LangGraph and MCP become live so status markers stay accurate
- add richer visual diagram treatment if desired later
- link specific architecture blocks to deeper technical pages or trace views if needed

Dependencies:

- current architecture docs
- final deployment plan

### 7. Optimization Page

Frontend status:

- implemented with summary card, before/after comparison, metrics, history table, and sample comparison

Backend status:

- optimization summary/list/detail endpoints are implemented

Remaining work:

- later connect the page to real DSPy optimization artifacts or runs
- add multiple selectable sample comparisons instead of a single saved example
- later connect optimization improvements directly back to evaluation and trace evidence

Dependencies:

- DSPy introduction later
- evaluation outputs

## Priority 2: Existing Pages Need Deeper Functional Completion

### 8. Customer Case Page Completion

Already present:

- detail view
- live AI review button
- approval request button
- links to simulator and trace

Remaining work:

- refresh local case state after live review
- persist and show latest real run id
- connect `View Full Trace` to a real run-specific trace route
- improve approval request state transition on the page
- show more explicit live-vs-baseline review state
- later support paused-for-approval and resumed states

### 9. Approvals Workflow Completion

Already present:

- approval queue page
- detail view
- approve/reject/revise actions

Remaining work:

- make queue state update after decisions
- reflect case status transitions after approve/reject/revise
- add resumed run linkage where appropriate
- later connect decisions to a real paused workflow instead of mock mutation-only responses
- add trace links from approval detail

Dependencies:

- LangGraph later

### 10. Simulator Completion

Already present:

- editable controls
- deterministic backend simulation
- save/delete scenarios

Remaining work:

- support loading a saved scenario back into the form
- support compare-against-selected-saved-scenario
- generate and surface a real trace reference
- upgrade simulation logic from deterministic rules to real AI-backed scenario analysis
- add LangSmith tracing for simulation runs

Dependencies:

- live AI integration expansion
- LangSmith

### 11. Portfolio and Overview Completion

Already present:

- overview dashboard
- portfolio filters/search
- links into cases and approvals

Remaining work:

- improve refresh behavior from real backend responses
- make recommended demo walkthrough entry feel guided
- ensure highlighted cases line up with the final walkthrough
- add deeper link consistency with real run and approval ids

## Priority 3: Workflow and Platform Infrastructure

### 12. LangGraph Workflow Orchestration

Current status:

- first workflow implemented
- `backend/app/workflows/case_review_graph.py` now runs:
  - `intake`
  - `review`
  - `policy`

Remaining work:

- explain the current graph in walkthrough/docs clearly
- expand beyond the first workflow into the fuller planned graph
- likely future nodes:
  - Case Intake Agent
  - Financial Risk Agent
  - Relationship Agent
  - Policy Check Agent
  - Recovery Strategy Agent
- define graph state model
- persist node outputs and statuses more durably
- support approval interrupts and resume paths
- broaden LangGraph outputs beyond the current case-review trace page integration

Why it matters:

- this is the real agent workflow layer promised in the product story

### 13. MCP Integration

Current status:

- planned only
- no MCP client/server integration in code yet

Remaining work:

- explain MCP before first implementation
- decide whether to mock MCP servers locally first or implement lightweight real ones
- integrate the first MCP-backed tool calls for:
  - customer profile
  - AR analytics
  - notes/policy
  - case actions
- surface MCP tool calls in LangGraph and the Trace page

Why it matters:

- it makes the agent architecture feel real and modular

### 14. LangSmith Expansion

Current status:

- live case-review workflow traced
- metadata and tags attached
- in-app trace page now reads real LangSmith-backed run context
- first LangGraph node execution is visible in live trace payloads

Remaining work:

- trace simulator runs
- trace approval-related workflow steps later
- publish or connect eval runs to LangSmith traces
- add trace links from case page and approvals page
- expand tracing as the LangGraph workflow becomes more agentic

### 15. Real Run Persistence

Current status:

- mostly mock/demo state
- no durable persistence for live run history

Remaining work:

- define where run history lives for deployed environment
- likely start with S3-backed JSON snapshots or a lightweight store
- persist:
  - run ids
  - recommendation outputs
  - trace references
  - saved simulations
  - approval decision history

Why it matters:

- Lambda is stateless, so durable state must live outside process memory

## Priority 4: Deployment and Production Alignment

### 16. CloudFront + Lambda Packaging

Current status:

- frontend static export works
- backend runs locally via FastAPI
- no full AWS deployment packaging yet in this repo slice

Remaining work:

- create deployment packaging for frontend static site
- create Lambda-compatible backend entrypoint and deployment flow
- validate API Gateway + Lambda behavior
- validate CloudFront clean-route rewrites for static pages

### 17. S3-backed Data Strategy

Current status:

- mock data currently lives in repo files

Remaining work:

- move demo portfolio and supporting datasets to S3-friendly format
- implement backend loaders that can later read from S3
- keep local-dev fallback
- use cost-conscious caching

### 18. Secrets and Environment Hardening

Current status:

- `.env.example` files exist
- real `.env` kept out of git

Remaining work:

- document final deployment env vars
- define AWS secret storage approach
- validate all required keys in startup path

## Priority 5: Nice-to-Have But Not Core Blockers

### 19. Create Case and Export Brief

Current status:

- `POST /api/cases` is TODO
- `GET /api/cases/{case_id}/brief/export` is TODO

Remaining work:

- implement manual case creation
- implement brief export

### 20. Better Frontend Live Preview Convenience

Current status:

- local static preview/dev behavior works but is sometimes awkward

Remaining work:

- improve local preview consistency
- add a reliable preview script if needed

## Page-by-Page Completion Snapshot

### Complete enough for core demo, but still evolving

- `Overview`
- `Portfolio`
- `Cases`
- `Customer Case`
- `Simulator`
- `Approvals`

### Implemented, but still missing real backend trace integration

- none of the major pages

### Not built yet beyond placeholder

- none among the major planned pages

## Recommended Build Order From Here

1. Introduce `MCP`.
2. Expand the LangGraph workflow beyond the first case-review slice.
3. Expand LangSmith to simulator, evals, and approval/resume flows.
4. Upgrade the simulator to real AI-backed analysis.
5. Add the final guided walkthrough.
6. Do final deployment-readiness and end-to-end QA.

## Final Rule For Future Work

Before marking any item complete, verify:

- frontend UI exists and is usable
- backend endpoint exists and returns the right typed shape
- buttons actually do something meaningful
- the flow is tested locally
- the feature does not break static-frontend + Lambda deployment assumptions
