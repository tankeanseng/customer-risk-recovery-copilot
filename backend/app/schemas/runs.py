from typing import Literal

from pydantic import BaseModel

from app.schemas.common import RunStatus


class WorkflowNodeSummary(BaseModel):
    node_id: str
    label: str
    status: RunStatus
    duration_ms: int
    model: str
    summary: str


class ToolCallTrace(BaseModel):
    tool_call_id: str
    node_id: str
    mcp_server: str
    tool_name: str
    status: Literal["completed", "failed"]
    latency_ms: int
    input_summary: str
    output_summary: str


class StructuredOutputEntry(BaseModel):
    node_id: str
    title: str
    payload: dict[str, str | int | float | bool | list[str]]


class ModelRoutingEntry(BaseModel):
    node_id: str
    model: str
    provider: str
    route_reason: str
    fallback_used: bool


class RunEvent(BaseModel):
    event_type: str
    timestamp: str
    node_id: str | None = None
    summary: str


class RunSummary(BaseModel):
    run_id: str
    case_id: str
    customer_id: str
    customer_name: str
    status: RunStatus
    started_at: str
    ended_at: str
    duration_ms: int
    estimated_cost_usd: float
    approval_interrupt_occurred: bool


class RunDetailResponse(BaseModel):
    run: RunSummary
    workflow_nodes: list[WorkflowNodeSummary]
    tool_calls: list[ToolCallTrace]
    structured_outputs: list[StructuredOutputEntry]
    model_routing: list[ModelRoutingEntry]
    events: list[RunEvent]


class RunStatusResponse(BaseModel):
    run_id: str
    status: RunStatus
    current_node: str | None = None
    last_event: str


class RunCompareResponse(BaseModel):
    baseline_run_id: str
    candidate_run_id: str
    differences: list[str]
