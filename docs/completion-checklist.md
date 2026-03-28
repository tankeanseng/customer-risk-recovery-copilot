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
- first MCP-backed tool access in the intake step
- model evaluation harness for case review

### Major platform pieces not yet implemented

- guided walkthrough across the full app
- deployment packaging for CloudFront + Lambda
- S3-backed data loading and persistence strategy
- deeper multi-agent LangGraph orchestration beyond the first workflow slice
- broader MCP expansion beyond the first tool-call slice

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
- real MCP tool calls now appear in live traces:
  - `customer-profile-mcp`
  - `ar-analytics-mcp`
  - `notes-policy-mcp`
- UI still falls back to demo data when no live trace is available

Remaining work:

- support richer run history instead of only latest-by-case
- expose explicit live trace/run identifiers more widely across the app
- add even deeper LangSmith metadata display in the trace page
- show richer timeline detail as more workflow steps exist
- deepen the MCP section with richer argument/output rendering and, later, resources/prompts

Dependencies:

- LangSmith
- current `live_case_review` metadata

### 2. Guided Demo Walkthrough

Status:

- implemented as a route-aware guided overlay
- walkthrough entry points now exist on:
  - sidebar recommended demo card
  - Overview hero
  - Overview guided demo panel
  - Portfolio page
- current guided path covers:
  - Overview
  - Portfolio
  - Customer Case
  - Trace
  - Simulator
  - Approvals
  - Evaluation
  - Optimization
  - Data Explorer
  - Architecture

Remaining work:

- deepen page-specific wording as more workflow states become live
- add more explicit approval/resume guidance once paused workflows exist
- later add walkthrough-aware highlighting of real run ids and richer trace metadata
- keep the LangSmith explanation step aligned with the actual trace UI as it evolves

Dependencies:

- all major pages must be implemented enough to feel coherent

### 3. Complete Demo Readiness QA

Status:

- slice-by-slice testing exists
- browser-based cross-page QA exists with Playwright against exported frontend + live backend
- core multi-page flows are now exercised end to end:
  - navigation and page rendering
  - live case review
  - approval submission and decision
  - trace navigation
  - simulator edit/run/save/load/compare/delete

Remaining work:

- create a final demo acceptance checklist
- expand coverage to every remaining low-frequency action and edge-case button state
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
- approval request now returns a real approval id and links directly into the approval detail page
- case detail now refreshes from the real backend after actions
- case detail now surfaces latest run, approval, and case-state linkage more clearly

Remaining work:

- refresh broader local case narrative after live review
- show more explicit live-vs-baseline review state
- later support paused-for-approval and resumed states

### 9. Approvals Workflow Completion

Already present:

- approval queue page
- detail view
- approve/reject/revise actions
- queue and case state now update after decisions
- approval detail now shows latest run linkage
- approved decisions now create a real traced approval-resume workflow and trace link target
- case page can now create a new approval request dynamically

Remaining work:

- add richer approval-specific trace timeline detail
- surface approval state refresh more deeply across all already-open pages

Dependencies:

- LangGraph later

### 10. Simulator Completion

Already present:

- editable controls
- live AI-backed simulation using the existing LangGraph review workflow
- MCP-backed simulator intake now stays live even when stdio subprocess transport is unavailable locally, via in-process tool fallback
- save/delete scenarios
- load a saved scenario back into the working form
- compare the current working scenario against a selected saved scenario
- real simulation trace ids
- LangSmith-backed simulation traces
- MCP-backed simulation context through the intake step
- live-generated simulations are now persisted in the local runtime state store
- saved scenario names now persist instead of collapsing into a generic placeholder label

Remaining work:

- deepen the explanation panel with more explicit live-vs-baseline reasoning
- add richer trace-specific simulation labeling if desired
- continue quality regression checks across more scenario variants as the prompt/workflow evolves

Dependencies:

- live AI integration expansion
- LangSmith

### 11. Portfolio and Overview Completion

Already present:

- overview dashboard
- portfolio filters/search
- links into cases and approvals
- walkthrough entry points

Remaining work:

- improve refresh behavior from real backend responses
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
- broaden LangGraph outputs beyond the current case-review trace page integration

Why it matters:

- this is the real agent workflow layer promised in the product story

### 13. MCP Integration

Current status:

- first slice implemented
- local stdio MCP servers now exist for:
  - customer profile
  - AR analytics
  - notes/policy
- live case review now performs real MCP tool calls during intake
- trace page now shows real MCP tool calls from live traces

Remaining work:

- explain the current MCP slice in walkthrough/docs clearly
- add `case-actions-mcp`
- expand from tools-only into richer resources/prompts where useful
- decide which MCP servers stay local versus become remote later
- surface richer MCP arguments/results in the Trace page
- later use MCP for more of the data explorer and approval flows

Why it matters:

- it makes the agent architecture feel real and modular

### 14. LangSmith Expansion

Current status:

- live case-review workflow traced
- metadata and tags attached
- in-app trace page now reads real LangSmith-backed run context
- first LangGraph node execution is visible in live trace payloads

Remaining work:

- publish or connect eval runs to LangSmith traces
- add trace links from case page and approvals page
- expand tracing as the LangGraph workflow becomes more agentic

### 15. Real Run Persistence

Current status:

- local file-backed runtime state store is now implemented
- dynamic case queue state, approvals, resumed runs, and simulations now persist across requests
- storage boundary is shaped so local file storage can later be swapped to S3-backed blobs for Lambda deployment

Remaining work:

- define where run history lives for deployed environment
- replace the local blob store with S3-backed JSON snapshots or a lightweight managed store in AWS
- persist:
  - run ids
  - recommendation outputs
  - trace references
  - saved simulations
  - approval decision history
- decide whether live case-review results should also be snapshotted more explicitly for later analytics/evals

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
- runtime state persistence now has a local blob-store abstraction ready to swap to S3 later

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

1. Expand the LangGraph workflow beyond the first case-review slice.
2. Expand LangSmith to approval/resume flows and richer trace metadata.
3. Deepen approval and customer-case state transitions.
4. Add final full-app acceptance QA and deployment-hardening passes.
4. Add real run persistence suitable for CloudFront + Lambda deployment.
5. Do final deployment-readiness and end-to-end QA.

## Final Rule For Future Work

Before marking any item complete, verify:

- frontend UI exists and is usable
- backend endpoint exists and returns the right typed shape
- buttons actually do something meaningful
- the flow is tested locally
- the feature does not break static-frontend + Lambda deployment assumptions
