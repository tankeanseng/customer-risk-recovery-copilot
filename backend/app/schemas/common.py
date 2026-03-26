from typing import Literal

from pydantic import BaseModel, Field

RiskBand = Literal["Low", "Monitor", "Watchlist", "High", "Critical"]
RunStatus = Literal["queued", "running", "completed", "failed", "paused_for_approval", "resumed"]
ApprovalStatus = Literal["none", "pending", "approved", "rejected", "revision_requested"]
ReviewMode = Literal["baseline", "live"]


class TriggerReasonChip(BaseModel):
    label: str = Field(..., description="Short user-facing reason chip shown in UI.")


class PageMeta(BaseModel):
    generated_at: str

