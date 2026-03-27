from fastapi import APIRouter, HTTPException

from app.schemas.data import (
    CustomersDataResponse,
    DataRecordDetailResponse,
    DataSummaryResponse,
    DisputesDataResponse,
    InvoicesDataResponse,
    NotesDataResponse,
    OrdersDataResponse,
    PaymentsDataResponse,
    PoliciesDataResponse,
)
from app.services.data_explorer import (
    get_customers,
    get_data_summary,
    get_disputes,
    get_invoices,
    get_notes,
    get_orders,
    get_payments,
    get_policies,
    get_record_detail,
)

router = APIRouter()

@router.get("/data/summary", response_model=DataSummaryResponse)
async def data_summary() -> DataSummaryResponse:
    return get_data_summary()


@router.get("/data/customers", response_model=CustomersDataResponse)
async def customers() -> CustomersDataResponse:
    return get_customers()


@router.get("/data/invoices", response_model=InvoicesDataResponse)
async def invoices() -> InvoicesDataResponse:
    return get_invoices()


@router.get("/data/payments", response_model=PaymentsDataResponse)
async def payments() -> PaymentsDataResponse:
    return get_payments()


@router.get("/data/orders", response_model=OrdersDataResponse)
async def orders() -> OrdersDataResponse:
    return get_orders()


@router.get("/data/notes", response_model=NotesDataResponse)
async def notes() -> NotesDataResponse:
    return get_notes()


@router.get("/data/disputes", response_model=DisputesDataResponse)
async def disputes() -> DisputesDataResponse:
    return get_disputes()


@router.get("/data/policies", response_model=PoliciesDataResponse)
async def policies() -> PoliciesDataResponse:
    return get_policies()


@router.get("/data/records/{record_type}/{record_id}", response_model=DataRecordDetailResponse)
async def record_detail(record_type: str, record_id: str) -> DataRecordDetailResponse:
    try:
        return get_record_detail(record_type, record_id)
    except HTTPException as exc:
        raise exc
