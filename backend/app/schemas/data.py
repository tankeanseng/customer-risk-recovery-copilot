from typing import Literal

from pydantic import BaseModel


DataDomain = Literal["customers", "invoices", "payments", "orders", "notes", "disputes", "policies"]


class DataSummaryCounts(BaseModel):
    customers: int
    invoices: int
    payments: int
    orders: int
    notes: int
    disputes: int
    policies: int


class DataSummaryResponse(BaseModel):
    summary: DataSummaryCounts
    domains: list[DataDomain]


class CustomersDataResponse(BaseModel):
    rows: list[dict[str, str | int | float | bool]]


class InvoicesDataResponse(BaseModel):
    rows: list[dict[str, str | int | float | bool]]


class PaymentsDataResponse(BaseModel):
    rows: list[dict[str, str | int | float | bool]]


class OrdersDataResponse(BaseModel):
    rows: list[dict[str, str | int | float | bool | list[str]]]


class NotesDataResponse(BaseModel):
    rows: list[dict[str, str | int | float | bool]]


class DisputesDataResponse(BaseModel):
    rows: list[dict[str, str | int | float | bool]]


class PoliciesDataResponse(BaseModel):
    rows: list[dict[str, str | int | float | bool]]


class LinkedEntitiesResponse(BaseModel):
    customer_id: str | None = None
    case_ids: list[str]
    related_payment_ids: list[str]
    used_in_run_ids: list[str]


class DataRecordDetailResponse(BaseModel):
    record_type: str
    record_id: str
    detail: dict[str, str | int | float | bool | list[str]]
    linked_entities: LinkedEntitiesResponse
