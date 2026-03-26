# Secrets And Model Strategy

This file is the source of truth for environment secrets, model selection strategy, and observability decisions for the demo app.

## Current status

The current codebase does **not** use real external secrets yet.

At this stage:

- frontend pages use local demo data
- backend endpoints use mock response objects
- OpenAI API is not wired yet
- LangSmith is not wired yet
- AWS deployment is not wired yet

The first real secret we will need is `OPENAI_API_KEY`.

## Environment files

Planned local files:

- `backend/.env`
- `frontend/.env.local`

Committed examples:

- `backend/.env.example`
- `frontend/.env.local.example`

Real secrets must never be committed to git.

## Backend secrets

### Required when OpenAI integration starts

- `OPENAI_API_KEY`

### Required when LangSmith tracing starts

- `LANGSMITH_TRACING`
- `LANGSMITH_API_KEY`
- `LANGSMITH_PROJECT`
- `LANGSMITH_ENDPOINT`

### Optional when LiteLLM is introduced

- `LITELLM_BASE_URL`
- `LITELLM_MASTER_KEY`

### Required for AWS deployment/runtime

Recommended:

- `AWS_REGION`
- `AWS_PROFILE`

Possible if using raw credentials locally:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

## Frontend environment variables

### Required once frontend talks to backend

- `NEXT_PUBLIC_API_BASE_URL`

### Optional

- `NEXT_PUBLIC_APP_ENV`

## LangSmith decision

The project will use **LangSmith Cloud**, not self-hosted LangSmith.

Reason:

- much faster to integrate
- strong interviewer signal
- lower operational burden
- enough for this public demo project

We are not planning to self-host LangSmith unless requirements change later.

## How LangSmith works in this project

LangSmith is the observability and evaluation layer for LLM workflows.

In practical terms, it will help us:

- trace each AI run
- inspect prompts and outputs
- inspect tool calls and node execution
- compare runs across versions
- run evaluations on built-in demo cases
- debug failures in recommendation or policy routing

### Simple mental model

Think of LangSmith as:

> the flight recorder and QA lab for the AI parts of the app

### What goes into LangSmith

Examples:

- customer case review run
- workflow node outputs
- prompts and model responses
- simulation runs
- evaluation scenarios

### What comes out

Examples:

- trace timeline
- step-level inspection
- pass/fail evaluation results
- regression comparison
- debugging visibility when a recommendation is wrong

### Why we want it here

This project is trying to show:

- agent workflow
- real AI behavior
- production-minded observability
- evaluation rigor

LangSmith helps make those parts visible.

## Model selection strategy

We should optimize for:

- good enough quality
- stable structured outputs
- strong policy compliance
- low enough cost for a public demo

We should **not** default to the most expensive model without evidence.

## Initial evaluation shortlist

We will evaluate these OpenAI models:

- `gpt-5.4-mini`
- `gpt-5.4-nano`
- `gpt-5.1`
- `gpt-5.2`

## Recommended starting assumptions

### Default main workflow model

- `gpt-5.4-mini`

Reason:

- likely best balance for recommendation quality vs cost

### Stronger benchmark model

- `gpt-5.1`

Reason:

- useful comparison point for ambiguous cases

### Hard-case comparison model

- `gpt-5.2`

Reason:

- test only where quality gain may justify extra cost

### Cheapest narrow-task model

- `gpt-5.4-nano`

Reason:

- useful for very lightweight substeps, not assumed to be the best full recommendation model

## How we will choose the final model

We will test models across realistic built-in cases and score them on:

- recommendation quality
- policy compliance
- approval-routing correctness
- structured output validity
- consistency on borderline cases
- simulation delta quality
- cost per run

This decision will be made with eval data, not instinct.

## Structured output failure policy

If a model returns invalid structured output:

1. validate with `Pydantic`
2. retry with validation feedback
3. retry once more if needed
4. optionally escalate to a stronger model for the final attempt
5. fail gracefully if still invalid

We should never retry indefinitely.

## Final current recommendation

When we begin real OpenAI integration:

- start with `gpt-5.4-mini`
- benchmark against `gpt-5.1`
- test `gpt-5.2` on harder cases only
- consider `gpt-5.4-nano` only for cheap narrow subtasks

## References

- OpenAI GPT-5.4: https://developers.openai.com/api/docs/models/gpt-5.4
- OpenAI GPT-5.4 mini: https://developers.openai.com/api/docs/models/gpt-5.4-mini
- OpenAI GPT-5.4 nano: https://developers.openai.com/api/docs/models/gpt-5.4-nano
- OpenAI structured outputs: https://platform.openai.com/docs/guides/structured-outputs
- LangSmith overview: https://docs.langchain.com/langsmith
- LangSmith hosting: https://docs.langchain.com/langsmith/hosting
