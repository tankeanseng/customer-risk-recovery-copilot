# LangGraph Learning Notes

`LangGraph` is the workflow engine we use when an AI feature should run as a series of connected steps instead of one big function call.

## Smallest mental model

Think of a LangGraph workflow like this:

```text
input state -> node 1 -> node 2 -> node 3 -> final state
```

Each node:
- receives the current state
- returns a small state update

The graph merges those updates into one final state object.

## Tiny example

```python
from typing import TypedDict
from langgraph.graph import START, END, StateGraph


class MathState(TypedDict, total=False):
    number: int
    doubled: int
    final_message: str


def double_node(state: MathState) -> MathState:
    return {"doubled": state["number"] * 2}


def message_node(state: MathState) -> MathState:
    return {"final_message": f"The doubled value is {state['doubled']}."}


graph = StateGraph(MathState)
graph.add_node("double", double_node)
graph.add_node("message", message_node)
graph.add_edge(START, "double")
graph.add_edge("double", "message")
graph.add_edge("message", END)

compiled = graph.compile()
result = compiled.invoke({"number": 4})
print(result)
```

### Input

```python
{"number": 4}
```

### Output

```python
{
  "number": 4,
  "doubled": 8,
  "final_message": "The doubled value is 8."
}
```

## What each LangGraph part means

### `TypedDict`
Defines the shape of the graph state.

```python
class MathState(TypedDict, total=False):
    number: int
    doubled: int
    final_message: str
```

### `StateGraph(...)`
Creates the workflow container.

```python
graph = StateGraph(MathState)
```

### `add_node(...)`
Registers a step.

```python
graph.add_node("double", double_node)
```

### `START` and `END`
Built-in markers for beginning and end of the workflow.

```python
graph.add_edge(START, "double")
graph.add_edge("message", END)
```

### `compile()`
Builds the graph into a runnable object.

```python
compiled = graph.compile()
```

### `invoke(...)`
Runs the graph with an initial state.

```python
result = compiled.invoke({"number": 4})
```

## Our project example

For the case review workflow, we use this graph shape:

```text
START
  -> intake
  -> review
  -> policy
  -> END
```

### State shape

```python
class CaseReviewGraphState(TypedDict, total=False):
    case_payload: dict[str, Any]
    model_override: str | None
    intake_summary: dict[str, Any]
    review_output: dict[str, Any]
    provider_model: str
    policy_gate: dict[str, Any]
```

### Intake node
Summarizes triage context before the model call.

Input:
- `case_payload`

Output example:

```python
{
  "triage_score": 63,
  "triage_risk_band": "Watchlist",
  "hard_trigger_hit": False,
  "trigger_reason_count": 3,
  "trigger_reason_labels": [
    "Rising overdue trend",
    "Partial payments",
    "Order decline"
  ],
  "summary": "Prepared case case_012 for live review with triage band Watchlist."
}
```

### Review node
Runs the live model-backed structured review.

Input:
- `case_payload`
- optional `model_override`

Output example:

```python
{
  "review_output": {
    "risk_band": "Watchlist",
    "risk_score": 66,
    "customer_summary": "Mid-value foodservice buyer with moderate overdue exposure and ongoing engagement.",
    "risk_summary": "Risk is elevated by rising overdue days, partial payments, and a softening order trend.",
    "recommended_action": "Schedule monitored recovery call",
    "why_now": "The account is near escalation thresholds.",
    "policy_status": "Currently compliant; approval is not yet required.",
    "next_steps": [
      "Call customer within 48 hours",
      "Confirm repayment timeline",
      "Rerun review if no payment arrives"
    ],
    "risk_drivers": [
      "Rising overdue trend",
      "Partial payment stress",
      "Softening order demand"
    ],
    "policy_summary": [
      "Borderline exposure review trigger remains active",
      "No hard approval threshold crossed yet"
    ]
  },
  "provider_model": "openai/gpt-5.4-mini",
  "summary": "Model review completed with openai/gpt-5.4-mini."
}
```

### Policy node
Adds deterministic policy interpretation after the model result.

Input:
- `case_payload`
- `review_output`

Output example:

```python
{
  "approval_required": False,
  "approval_reason": "No immediate approval needed after live review.",
  "policy_summary": [
    "Borderline exposure review trigger remains active",
    "No hard approval threshold crossed yet"
  ],
  "summary": "Policy step cleared case without approval."
}
```

## Why we use LangGraph here

Before LangGraph, our live review was one big function:

```text
case payload -> model call -> result
```

Now we have a real workflow:

```text
case payload
  -> intake analysis
  -> model-backed review
  -> policy interpretation
  -> final result
```

That gives us:
- cleaner orchestration
- easier future expansion
- a better trace story
- a natural place to add more steps later

## Why this matters for later

This small graph is the stepping stone to the full planned workflow:

```text
Case Intake Agent
-> Financial Risk Agent
-> Relationship Agent
-> Policy Check Agent
-> Recovery Strategy Agent
-> Approval Router
```

That larger workflow is exactly where LangGraph becomes especially valuable.
