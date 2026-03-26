# Implementation Readiness Audit

This document checks that the app can be implemented end-to-end without missing critical interactions, APIs, or state transitions.

The goal is to prevent:

- dead buttons
- unsupported UI states
- missing endpoints
- inconsistent navigation
- broken cross-page flows

## Audit Summary

The product is organized into:

- 11 pages
- 4 MCP servers
- 5 specialist agents
- 1 portfolio triage layer
- live AI workflows triggered selectively

The main implementation risk areas were:

- approval request creation
- export action support
- triage logic visibility
- run replay/compare support
- simulation save/delete support

These are now explicitly covered in the API surface.

## Button And Function Matrix

### Overview Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| `Launch Demo Walkthrough` | navigation | none | Opens guided path starting from featured case |
| `Open Architecture` | navigation | none | Goes to Architecture page |
| `View Portfolio` | navigation | none | Goes to Portfolio page |
| `Open Case` on critical case | navigation | none | Opens case by `case_id` |
| `View Trace` on critical case or active run | navigation | none | Opens run trace |
| `Open Approval` | navigation | none | Opens Approvals page with selected approval |
| `View Evaluation` | navigation | none | Opens Evaluation page |
| `View Optimization` | navigation | none | Opens Optimization page |
| `View Triage Logic` | modal/data fetch | `GET /api/triage/rules` | Shows scoring and trigger logic |

### Portfolio Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| `Refresh Portfolio` | fetch | `GET /api/portfolio` | Refetch current portfolio |
| `Open Demo Case` | navigation | none | Opens recommended featured case |
| filter changes | fetch or local query state | `GET /api/portfolio` with params | Keep URL/query state stable |
| `Open Case` | navigation | none | Opens case page |
| `Run Review` | mutation | `POST /api/cases/{case_id}/runs` | Starts live AI review |
| `Compare` | local state | none | Client-side compare mode |
| `Pin To Simulator` | navigation/state | none | Opens simulator with current case |
| `Why Flagged` | modal/local detail | data already in row | Uses trigger reason data from row/expanded row |

### Customer Case Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| `Back To Portfolio` | navigation | none | Return to portfolio |
| `Open In Cases` | navigation | none | Open case in Cases page context |
| `Run AI Review` | mutation | `POST /api/cases/{case_id}/runs` | Creates a new run |
| `Rerun Review` | mutation | `POST /api/cases/{case_id}/runs` | Same endpoint, new run |
| `Open Simulator` | navigation | none | Goes to simulator page for case |
| `View Full Trace` | navigation | none | Open latest run trace |
| `Submit For Approval` | mutation | `POST /api/cases/{case_id}/approval-requests` | Creates approval request from recommendation |
| `Export Brief` | file/download | `GET /api/cases/{case_id}/brief/export` | PDF or JSON export |
| `View Trace` in recommendation card | navigation | none | Open latest trace |
| `View Policy Check` | local panel/tab | none | Scroll or focus policy section |
| `View Triage Inputs` | modal/data already loaded | none | Shows triage provenance details |
| `View Triage Logic` | modal/data fetch | `GET /api/triage/rules` | Same triage rules endpoint |
| `Run Live AI Review` | mutation | `POST /api/cases/{case_id}/runs` | Explicitly signals live recomputation |

### AI Workflow Trace Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| `Replay Run` | mutation | `POST /api/runs/{run_id}/replay` | Replays or reruns same case context |
| `Compare Run` | fetch/navigation | `GET /api/runs/{run_id}/compare?other_run_id=` | Needs run selector UI |
| `Back To Case` | navigation | none | Return to case page |
| node select | local state | data already loaded | Filters panels |
| `View Request Detail` | local drawer | data already loaded | Uses full tool call payload |
| `View Response Detail` | local drawer | data already loaded | Uses full tool call payload |

### What-If Simulator Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| `Run Simulation` | mutation | `POST /api/cases/{case_id}/simulate` | Live recomputation |
| `Reset To Baseline` | local state | none | Restores default scenario inputs |
| `Save Scenario` | mutation | `POST /api/simulations/{simulation_id}/save` | Save latest completed simulation |
| `Open Simulation Trace` | navigation | none | Open trace for latest simulation run |
| preset buttons | local state | none | Apply preset input deltas before running |
| `Load` scenario | fetch/local state | `GET /api/simulations/{simulation_id}` | Load saved scenario |
| `Compare` scenario | fetch/local state | `GET /api/simulations/{simulation_id}` | Compare with baseline or another scenario |
| `Delete` scenario | mutation | `DELETE /api/simulations/{simulation_id}` | Remove saved simulation |

### Cases Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| `Create Case` | mutation | `POST /api/cases` | Manual case creation |
| status filter cards | fetch or local filter | `GET /api/cases` | Prefer query params |
| `Open` row | navigation | none | Open case page |
| `Run` row | mutation | `POST /api/cases/{case_id}/runs` | Start review |
| `Trace` row | navigation | none | Open latest run trace |

### Approvals Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| `Refresh Queue` | fetch | `GET /api/approvals` | Refresh approvals list |
| queue row select | fetch/local state | `GET /api/approvals/{approval_id}` or preloaded detail | Detail panel update |
| `Approve` | mutation | `POST /api/approvals/{approval_id}/approve` | Should return resumed run id if resumed |
| `Reject` | mutation | `POST /api/approvals/{approval_id}/reject` | Update case/approval state |
| `Request Revision` | mutation | `POST /api/approvals/{approval_id}/revise` | Sends case back to review |

### Evaluation Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| `Run Evaluation Suite` | mutation | `POST /api/evals/run` | Async or background allowed |
| failure row select | local state | data already loaded or `GET /api/evals/runs/{eval_run_id}` | Fills failure panel |
| `Open Trace` | navigation | none | Open linked trace |
| `Open Optimization` | navigation | none | Open Optimization page |

### Optimization Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| `View Evaluation Impact` | navigation | none | Open Evaluation page |
| experiment row select | fetch/local state | `GET /api/optimization/runs/{optimization_run_id}` | Updates sample comparison |
| sample case switch | fetch/local state | same run detail endpoint or summary payload | No mutation |

### Data Explorer Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| summary card click | fetch/local state | `GET /api/data/{domain}` | Switch domain |
| domain tab switch | fetch/local state | `GET /api/data/{domain}` | Change records table |
| record row select | fetch | `GET /api/data/records/{record_type}/{record_id}` | Open detail drawer |
| `Open Case` | navigation | none | Jump to linked case |
| `Open Trace` | navigation | none | Jump to linked trace |

### Architecture Page

| Button / Action | Type | Backend/API | Notes |
|---|---|---|---|
| diagram block inspect | local interaction | `GET /api/architecture` preloaded | Tooltip, overlay, or focus |

## Critical End-To-End Flows

### Flow 1: Portfolio triage to AI review

1. `GET /api/portfolio`
2. user selects flagged row
3. open case page via `GET /api/cases/{case_id}`
4. click `Run AI Review`
5. `POST /api/cases/{case_id}/runs`
6. poll `GET /api/runs/{run_id}/status` or `GET /api/runs/{run_id}`
7. open `AI Workflow Trace`

### Flow 2: Recommendation to approval

1. case page shows approval-sensitive recommendation
2. user clicks `Submit For Approval`
3. `POST /api/cases/{case_id}/approval-requests`
4. case moves to `awaiting_approval`
5. Approvals page loads queue
6. user approves/rejects/revises
7. if approved and resumable, backend returns resumed run id

### Flow 3: Simulator

1. open case
2. open simulator
3. modify inputs locally
4. click `Run Simulation`
5. `POST /api/cases/{case_id}/simulate`
6. optionally `POST /api/simulations/{simulation_id}/save`
7. open simulation trace if desired

## Required Loading And Error States

Every mutation button must support:

- idle
- loading
- success feedback
- failure feedback
- retry

Buttons that trigger backend mutations:

- Run AI Review
- Rerun Review
- Submit For Approval
- Approve
- Reject
- Request Revision
- Run Simulation
- Save Scenario
- Run Evaluation Suite
- Replay Run
- Create Case

## Required Empty States

The app must include deliberate empty states for:

- no active AI runs
- no pending approvals
- no saved scenarios
- no failed eval cases
- no matching table rows after filters/search
- no record selected in detail-panel pages

## Missing-Detail Checks Completed

### Added or clarified endpoints

- `GET /api/triage/rules`
- `POST /api/cases/{case_id}/approval-requests`
- `GET /api/cases/{case_id}/brief/export`
- `GET /api/runs/{run_id}/status`
- `POST /api/runs/{run_id}/replay`
- `GET /api/runs/{run_id}/compare`
- `GET /api/simulations/{simulation_id}`
- `POST /api/simulations/{simulation_id}/save`
- `DELETE /api/simulations/{simulation_id}`
- `GET /api/approvals/{approval_id}`

### Remaining implementation assumptions

These are acceptable assumptions for the demo:

- no full auth/role system is required in v1 demo
- all users can access all demo pages
- compare mode can remain client-side initially
- architecture diagrams can be rendered from static JSON payloads

## Final Readiness Assessment

The app is now specification-complete enough to proceed to implementation.

The biggest remaining work is no longer design completeness. It is execution:

- scaffold app structure
- build shared shell
- implement mock data and APIs
- build pages in the planned order

