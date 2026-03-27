# LangSmith Integration

## Current Status

LangSmith tracing is now wired into the first real AI-powered workflow:

- `Run AI Review` on the customer case page

Current traced functions:

- `live_case_review` with run type `chain`
- `case_review_model_call` with run type `llm`

These traces are emitted from:

- `backend/app/services/case_review.py`
- `backend/app/workflows/case_review_graph.py`

## What Is Being Traced

For the live case-review path, LangSmith currently captures:

- the outer workflow invocation
- the LangGraph wrapper span
- the intake node
- the review node
- the nested model-call step
- the policy node
- the model input/output boundary for the live review path

This gives us the first real LangSmith visibility for the project with a real LangGraph workflow already in place.

## Metadata Strategy

LangSmith traces now carry a deliberate metadata and tagging scheme instead of only generic run names.

### Outer workflow trace: `live_case_review`

This top-level trace is the one we want to use later for:

- filtering runs by customer or case
- showing meaningful trace details in the in-app trace page
- explaining the demo walkthrough without making the trace feel too low-level

Metadata currently attached:

- `trace_schema_version`
- `workflow_name`
- `review_surface`
- `case_id`
- `customer_name`
- `segment`
- `region`
- `tier`
- `strategic`
- `baseline_risk_band`
- `baseline_risk_score`
- `triage_score`
- `triage_risk_band`
- `hard_trigger_hit`
- `case_source`

Tags currently attached:

- `workflow:case-review`
- `risk-band:<value>`
- `segment:<value>`
- `region:<value>`
- `strategic` or `non-strategic`

### Nested model-call trace: `case_review_model_call`

This child trace keeps the business context above, and adds the model-call details needed for debugging.

Additional metadata currently attached:

- `provider_model`
- `attempt`
- `message_count`
- `response_format`

Additional tag currently attached:

- `span:model-call`

### LangGraph workflow step traces

The first LangGraph slice now adds these traceable steps under the root workflow:

- `case_review_intake_node`
- `case_review_review_node`
- `case_review_policy_node`

The in-app trace page maps those to:

- `Intake Node`
- `Review Node`
- `Policy Node`

## Why These Fields Were Chosen

The metadata set is split into 2 purposes:

### Demo and product storytelling

These fields help later when we want to show interviewers why the trace matters:

- `case_id`
- `customer_name`
- `baseline_risk_band`
- `triage_score`
- `hard_trigger_hit`
- `review_surface`

These make the trace easy to relate back to the UI.

### Debugging and analysis

These fields help us inspect model behavior and segment results:

- `segment`
- `region`
- `tier`
- `strategic`
- `provider_model`
- `attempt`
- `message_count`
- `response_format`

These are useful when comparing model quality, reruns, and later eval behavior.

## Fields We Are Intentionally Not Adding Yet

To keep traces readable and avoid unnecessary noise, we are intentionally not attaching large raw objects as metadata, such as:

- the full case payload
- the full triage object
- all notes text
- full prompt text as extra metadata

Those are already visible in traced function inputs and outputs when useful, so duplicating them into metadata would make the trace harder to scan.

## Verification

The integration was verified by listing recent runs in the configured LangSmith project and confirming recent traces existed for:

- `live_case_review`
- `LangGraph`
- `case_review_intake_node`
- `case_review_review_node`
- `case_review_model_call`
- `case_review_policy_node`

It was also verified that both traces now expose business-friendly metadata such as:

- `case_id`
- `customer_name`
- `baseline_risk_band`
- `triage_score`

It was also verified that the trace payload returned by the app can now surface the LangGraph step sequence:

- `Live Case Review`
- `Intake Node`
- `Review Node`
- `Policy Node`
- `Model Call`

The app also now uses real LangSmith-backed run ids in more places:

- live case review responses can return the actual trace/run id
- the trace page can show recent run history for a selected case
- evaluation rows can link to real trace ids when a matching live case trace exists

## Current Limitation

LangSmith is currently being used as a tracing layer only.

It is **not yet** connected to:

- evaluation-run publishing
- simulator live tracing
- approval workflow tracing
- MCP tool traces

It is now partially connected to:

- the in-app trace page for latest live case-review traces by case
- the first LangGraph node-level orchestration for case review

## Why This Is Still Useful

This is the right incremental step because it proves:

- the project can emit real traces to LangSmith Cloud
- the LiteLLM-backed AI call is observable
- we can later map the trace page to real traces instead of only mock data

## Planned Next Steps

Recommended next LangSmith-related improvements:

1. publish evaluation-run outputs with model tags
2. deepen the trace page so it supports richer run history and LangSmith-first navigation
3. add trace links back into the case page and approvals page
4. expand beyond the first LangGraph workflow into richer multi-agent orchestration

## Walkthrough Planning Note

Later in the final demo walkthrough, LangSmith should be presented after the user has already seen:

1. portfolio triage
2. customer case review
3. live AI review action

Then the walkthrough can explain:

- how the recommendation was generated
- how the model call is traced
- why traceability matters for enterprise trust and debugging
