from fastapi import APIRouter

from app.schemas.approvals import ApprovalDecisionRequest, ApprovalDecisionResponse, ApprovalDetail, ApprovalQueueResponse
from app.services.approval_workflow import (
    apply_approval_decision,
    get_approval_detail,
    list_approvals as list_approvals_state,
)

router = APIRouter()


@router.get("/approvals", response_model=ApprovalQueueResponse)
async def list_approvals() -> ApprovalQueueResponse:
    return list_approvals_state()


@router.get("/approvals/{approval_id}", response_model=ApprovalDetail)
async def get_approval(approval_id: str) -> ApprovalDetail:
    return get_approval_detail(approval_id)


@router.post("/approvals/{approval_id}/approve", response_model=ApprovalDecisionResponse)
async def approve(approval_id: str, request: ApprovalDecisionRequest) -> ApprovalDecisionResponse:
    return apply_approval_decision(approval_id, "approve", request)


@router.post("/approvals/{approval_id}/reject", response_model=ApprovalDecisionResponse)
async def reject(approval_id: str, request: ApprovalDecisionRequest) -> ApprovalDecisionResponse:
    return apply_approval_decision(approval_id, "reject", request)


@router.post("/approvals/{approval_id}/revise", response_model=ApprovalDecisionResponse)
async def revise(approval_id: str, request: ApprovalDecisionRequest) -> ApprovalDecisionResponse:
    return apply_approval_decision(approval_id, "revise", request)
