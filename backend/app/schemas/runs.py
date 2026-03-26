from pydantic import BaseModel

from app.schemas.common import RunStatus


class WorkflowNodeSummary(BaseModel):
    node_id: str
    label: str
    status: RunStatus
    duration_ms: int
    model: str

