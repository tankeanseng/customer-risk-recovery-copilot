from fastapi import APIRouter, HTTPException

from app.data.mock_store import APPROVAL_DECISIONS, APPROVAL_DETAILS, APPROVAL_QUEUE
from app.schemas.approvals import ApprovalDecisionRequest, ApprovalDecisionResponse, ApprovalDetail, ApprovalQueueResponse

router = APIRouter()


@router.get("/approvals", response_model=ApprovalQueueResponse)
async def list_approvals() -> ApprovalQueueResponse:
    return APPROVAL_QUEUE


@router.get("/approvals/{approval_id}", response_model=ApprovalDetail)
async def get_approval(approval_id: str) -> ApprovalDetail:
    detail = APPROVAL_DETAILS.get(approval_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Approval {approval_id} not found")
    return detail


@router.post("/approvals/{approval_id}/approve", response_model=ApprovalDecisionResponse)
async def approve(approval_id: str, request: ApprovalDecisionRequest) -> ApprovalDecisionResponse:
    if approval_id not in APPROVAL_DETAILS:
        raise HTTPException(status_code=404, detail=f"Approval {approval_id} not found")
    return APPROVAL_DECISIONS["approve"].model_copy(update={"approval_id": approval_id})


@router.post("/approvals/{approval_id}/reject", response_model=ApprovalDecisionResponse)
async def reject(approval_id: str, request: ApprovalDecisionRequest) -> ApprovalDecisionResponse:
    if approval_id not in APPROVAL_DETAILS:
        raise HTTPException(status_code=404, detail=f"Approval {approval_id} not found")
    return APPROVAL_DECISIONS["reject"].model_copy(update={"approval_id": approval_id})


@router.post("/approvals/{approval_id}/revise", response_model=ApprovalDecisionResponse)
async def revise(approval_id: str, request: ApprovalDecisionRequest) -> ApprovalDecisionResponse:
    if approval_id not in APPROVAL_DETAILS:
        raise HTTPException(status_code=404, detail=f"Approval {approval_id} not found")
    return APPROVAL_DECISIONS["revise"].model_copy(update={"approval_id": approval_id})
