from typing import Any

from fastapi import HTTPException

from app.data.mock_store import CASES_LIST, CASE_DETAILS
from app.schemas.data import (
    CustomersDataResponse,
    DataRecordDetailResponse,
    DataSummaryCounts,
    DataSummaryResponse,
    DisputesDataResponse,
    InvoicesDataResponse,
    LinkedEntitiesResponse,
    NotesDataResponse,
    OrdersDataResponse,
    PaymentsDataResponse,
    PoliciesDataResponse,
)


def _case_row_map() -> dict[str, Any]:
    return {row.case_id: row for row in CASES_LIST.rows}


def _customer_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for case in CASES_LIST.rows:
        detail = CASE_DETAILS.get(case.case_id, {})
        rows.append(
            {
                "customer_id": case.customer_id,
                "name": case.customer_name,
                "segment": case.segment,
                "region": case.region,
                "payment_terms_days": _parse_terms(detail.get("payment_terms", "Net 30")),
                "credit_limit": float(detail.get("credit_limit", 0)),
                "strategic_flag": str(detail.get("strategic", "No")).lower() in {"yes", "true"},
                "account_owner": detail.get("account_owner", "Assigned account lead"),
            }
        )
    return rows


def _parse_terms(value: str) -> int:
    digits = "".join(char for char in value if char.isdigit())
    return int(digits or "0")


INVOICE_ROWS = [
    {
        "invoice_id": "inv_1202",
        "customer_id": "cust_012",
        "customer_name": "Horizon Foodservice Trading Sdn Bhd",
        "invoice_date": "2026-02-12",
        "due_date": "2026-03-13",
        "amount": 18200,
        "outstanding_amount": 18200,
        "days_overdue": 12,
        "status": "overdue",
    },
    {
        "invoice_id": "inv_1203",
        "customer_id": "cust_012",
        "customer_name": "Horizon Foodservice Trading Sdn Bhd",
        "invoice_date": "2026-02-28",
        "due_date": "2026-03-29",
        "amount": 9200,
        "outstanding_amount": 5400,
        "days_overdue": 0,
        "status": "partial",
    },
    {
        "invoice_id": "inv_1187",
        "customer_id": "cust_011",
        "customer_name": "Titan Facility Management Pte Ltd",
        "invoice_date": "2026-01-08",
        "due_date": "2026-02-22",
        "amount": 64000,
        "outstanding_amount": 64000,
        "days_overdue": 68,
        "status": "overdue",
    },
    {
        "invoice_id": "inv_1188",
        "customer_id": "cust_011",
        "customer_name": "Titan Facility Management Pte Ltd",
        "invoice_date": "2026-01-11",
        "due_date": "2026-02-25",
        "amount": 42000,
        "outstanding_amount": 42000,
        "days_overdue": 65,
        "status": "overdue",
    },
    {
        "invoice_id": "inv_1191",
        "customer_id": "cust_007",
        "customer_name": "GreenWave Hospitality Group",
        "invoice_date": "2026-01-19",
        "due_date": "2026-03-04",
        "amount": 51500,
        "outstanding_amount": 51500,
        "days_overdue": 58,
        "status": "overdue",
    },
    {
        "invoice_id": "inv_1175",
        "customer_id": "cust_002",
        "customer_name": "Meridian Retail Mart Sdn Bhd",
        "invoice_date": "2026-01-31",
        "due_date": "2026-03-02",
        "amount": 28400,
        "outstanding_amount": 28400,
        "days_overdue": 53,
        "status": "overdue",
    },
    {
        "invoice_id": "inv_1150",
        "customer_id": "cust_005",
        "customer_name": "Silverline Engineering Supplies Pte Ltd",
        "invoice_date": "2026-02-17",
        "due_date": "2026-03-19",
        "amount": 14600,
        "outstanding_amount": 14600,
        "days_overdue": 8,
        "status": "overdue",
    },
    {
        "invoice_id": "inv_1118",
        "customer_id": "cust_013",
        "customer_name": "HarborCare Corporate Services Pte Ltd",
        "invoice_date": "2026-03-01",
        "due_date": "2026-03-31",
        "amount": 8200,
        "outstanding_amount": 0,
        "days_overdue": 0,
        "status": "paid",
    },
]

PAYMENT_ROWS = [
    {
        "payment_id": "pay_991",
        "customer_id": "cust_012",
        "customer_name": "Horizon Foodservice Trading Sdn Bhd",
        "invoice_id": "inv_1203",
        "payment_date": "2026-03-15",
        "payment_amount": 3800,
        "partial_payment_flag": True,
    },
    {
        "payment_id": "pay_992",
        "customer_id": "cust_012",
        "customer_name": "Horizon Foodservice Trading Sdn Bhd",
        "invoice_id": "inv_1203",
        "payment_date": "2026-03-21",
        "payment_amount": 0,
        "partial_payment_flag": False,
    },
    {
        "payment_id": "pay_981",
        "customer_id": "cust_011",
        "customer_name": "Titan Facility Management Pte Ltd",
        "invoice_id": "inv_1188",
        "payment_date": "2026-02-14",
        "payment_amount": 6000,
        "partial_payment_flag": True,
    },
    {
        "payment_id": "pay_965",
        "customer_id": "cust_007",
        "customer_name": "GreenWave Hospitality Group",
        "invoice_id": "inv_1191",
        "payment_date": "2026-02-21",
        "payment_amount": 8000,
        "partial_payment_flag": True,
    },
    {
        "payment_id": "pay_944",
        "customer_id": "cust_013",
        "customer_name": "HarborCare Corporate Services Pte Ltd",
        "invoice_id": "inv_1118",
        "payment_date": "2026-03-12",
        "payment_amount": 8200,
        "partial_payment_flag": False,
    },
]

ORDER_ROWS = [
    {
        "order_id": "ord_9021",
        "customer_id": "cust_012",
        "customer_name": "Horizon Foodservice Trading Sdn Bhd",
        "order_date": "2026-03-02",
        "order_amount": 9200,
        "product_categories": ["Packaging & Takeaway Supplies", "Tissue & Paper Products"],
        "sku_count": 7,
    },
    {
        "order_id": "ord_8930",
        "customer_id": "cust_011",
        "customer_name": "Titan Facility Management Pte Ltd",
        "order_date": "2026-03-05",
        "order_amount": 16800,
        "product_categories": ["Facility Consumables", "Cleaning Supplies"],
        "sku_count": 10,
    },
    {
        "order_id": "ord_8874",
        "customer_id": "cust_007",
        "customer_name": "GreenWave Hospitality Group",
        "order_date": "2026-02-27",
        "order_amount": 14200,
        "product_categories": ["Pantry Supplies", "Packaging & Takeaway Supplies"],
        "sku_count": 9,
    },
    {
        "order_id": "ord_8811",
        "customer_id": "cust_005",
        "customer_name": "Silverline Engineering Supplies Pte Ltd",
        "order_date": "2026-03-03",
        "order_amount": 6100,
        "product_categories": ["Warehouse Consumables", "Protective Gloves"],
        "sku_count": 6,
    },
    {
        "order_id": "ord_8740",
        "customer_id": "cust_013",
        "customer_name": "HarborCare Corporate Services Pte Ltd",
        "order_date": "2026-03-06",
        "order_amount": 4100,
        "product_categories": ["Pantry Supplies", "Washroom Consumables"],
        "sku_count": 5,
    },
]

NOTE_ROWS = [
    {
        "note_id": "note_501",
        "customer_id": "cust_012",
        "customer_name": "Horizon Foodservice Trading Sdn Bhd",
        "note_date": "2026-03-18",
        "note_type": "promise_to_pay",
        "author_role": "Finance",
        "summary": "Customer committed to partial payment this week pending receivables collection.",
        "sentiment": "neutral",
        "promise_to_pay_flag": True,
    },
    {
        "note_id": "note_502",
        "customer_id": "cust_012",
        "customer_name": "Horizon Foodservice Trading Sdn Bhd",
        "note_date": "2026-03-20",
        "note_type": "account_manager",
        "author_role": "Account Manager",
        "summary": "Relationship remains recoverable with structured follow-up.",
        "sentiment": "positive",
        "promise_to_pay_flag": False,
    },
    {
        "note_id": "note_480",
        "customer_id": "cust_011",
        "customer_name": "Titan Facility Management Pte Ltd",
        "note_date": "2026-03-16",
        "note_type": "collections",
        "author_role": "Finance",
        "summary": "Collections calls have not produced a firm repayment timeline.",
        "sentiment": "negative",
        "promise_to_pay_flag": False,
    },
    {
        "note_id": "note_470",
        "customer_id": "cust_007",
        "customer_name": "GreenWave Hospitality Group",
        "note_date": "2026-03-14",
        "note_type": "strategic_exception",
        "author_role": "Commercial",
        "summary": "Commercial team requested softer handling due to contract renewal in progress.",
        "sentiment": "mixed",
        "promise_to_pay_flag": False,
    },
    {
        "note_id": "note_455",
        "customer_id": "cust_002",
        "customer_name": "Meridian Retail Mart Sdn Bhd",
        "note_date": "2026-03-12",
        "note_type": "promise_to_pay",
        "author_role": "Finance",
        "summary": "Customer requested a few more days for the third time this month.",
        "sentiment": "negative",
        "promise_to_pay_flag": True,
    },
]

DISPUTE_ROWS = [
    {
        "dispute_id": "disp_801",
        "customer_id": "cust_004",
        "customer_name": "NovaPack Print & Display Sdn Bhd",
        "opened_date": "2026-02-28",
        "dispute_type": "Quantity discrepancy",
        "dispute_amount": 3200,
        "status": "closed",
    },
    {
        "dispute_id": "disp_806",
        "customer_id": "cust_010",
        "customer_name": "Summit Lifestyle Retail Sdn Bhd",
        "opened_date": "2026-03-03",
        "dispute_type": "Delivery mismatch",
        "dispute_amount": 1800,
        "status": "open",
    },
]

POLICY_ROWS = [
    {
        "rule_id": "pol_03",
        "rule_name": "High exposure escalation threshold",
        "description": "Accounts with overdue exposure beyond threshold require manager approval.",
        "condition_type": "overdue_balance_threshold",
        "threshold": 150000,
        "action_required": "manager_review",
        "approval_required": True,
    },
    {
        "rule_id": "pol_07",
        "rule_name": "Borderline exposure review trigger",
        "description": "Accounts near threshold require enhanced monitoring.",
        "condition_type": "watchlist_threshold",
        "threshold": 60000,
        "action_required": "enhanced_monitoring",
        "approval_required": False,
    },
    {
        "rule_id": "pol_09",
        "rule_name": "Restrictive action approval rule",
        "description": "Restrictive credit actions require manager approval before execution.",
        "condition_type": "restrictive_action",
        "threshold": 1,
        "action_required": "approval_queue",
        "approval_required": True,
    },
]


def get_data_summary() -> DataSummaryResponse:
    return DataSummaryResponse(
        summary=DataSummaryCounts(
            customers=len(_customer_rows()),
            invoices=len(INVOICE_ROWS),
            payments=len(PAYMENT_ROWS),
            orders=len(ORDER_ROWS),
            notes=len(NOTE_ROWS),
            disputes=len(DISPUTE_ROWS),
            policies=len(POLICY_ROWS),
        ),
        domains=["customers", "invoices", "payments", "orders", "notes", "disputes", "policies"],
    )


def get_customers() -> CustomersDataResponse:
    return CustomersDataResponse(rows=_customer_rows())


def get_invoices() -> InvoicesDataResponse:
    return InvoicesDataResponse(rows=INVOICE_ROWS)


def get_payments() -> PaymentsDataResponse:
    return PaymentsDataResponse(rows=PAYMENT_ROWS)


def get_orders() -> OrdersDataResponse:
    return OrdersDataResponse(rows=ORDER_ROWS)


def get_notes() -> NotesDataResponse:
    return NotesDataResponse(rows=NOTE_ROWS)


def get_disputes() -> DisputesDataResponse:
    return DisputesDataResponse(rows=DISPUTE_ROWS)


def get_policies() -> PoliciesDataResponse:
    return PoliciesDataResponse(rows=POLICY_ROWS)


def get_record_detail(record_type: str, record_id: str) -> DataRecordDetailResponse:
    domain_map: dict[str, tuple[str, list[dict[str, Any]], str]] = {
        "customers": ("customer_id", _customer_rows(), "customer_id"),
        "invoices": ("invoice_id", INVOICE_ROWS, "customer_id"),
        "payments": ("payment_id", PAYMENT_ROWS, "customer_id"),
        "orders": ("order_id", ORDER_ROWS, "customer_id"),
        "notes": ("note_id", NOTE_ROWS, "customer_id"),
        "disputes": ("dispute_id", DISPUTE_ROWS, "customer_id"),
        "policies": ("rule_id", POLICY_ROWS, ""),
    }

    selected = domain_map.get(record_type)
    if selected is None:
        raise HTTPException(status_code=404, detail=f"Unknown record type: {record_type}")

    key_name, rows, customer_key = selected
    row = next((item for item in rows if str(item.get(key_name)) == record_id), None)
    if row is None:
        raise HTTPException(status_code=404, detail=f"Record {record_type}/{record_id} not found")

    customer_id = str(row.get(customer_key)) if customer_key and row.get(customer_key) is not None else None
    matching_cases = [case.case_id for case in CASES_LIST.rows if customer_id and case.customer_id == customer_id]
    latest_run_ids = [
        case.latest_run_id
        for case in CASES_LIST.rows
        if customer_id and case.customer_id == customer_id and case.latest_run_id is not None
    ]
    related_payment_ids = []
    if record_type == "invoices":
        related_payment_ids = [payment["payment_id"] for payment in PAYMENT_ROWS if payment["invoice_id"] == record_id]

    return DataRecordDetailResponse(
        record_type=record_type,
        record_id=record_id,
        detail=row,
        linked_entities=LinkedEntitiesResponse(
            customer_id=customer_id,
            case_ids=matching_cases,
            related_payment_ids=related_payment_ids,
            used_in_run_ids=latest_run_ids,
        ),
    )
