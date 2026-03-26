from typing import Literal

from pydantic import BaseModel


class ScenarioInputs(BaseModel):
    days_overdue_delta: int
    outstanding_balance_delta: float
    partial_payment_amount: float
    broken_promises_count_delta: int
    order_trend_state: Literal["recovering", "stable", "declining", "sharply_declining"]
    dispute_status: Literal["none", "open", "closed"]
    strategic_flag: bool
    credit_limit: float
    payment_terms_days: int
    account_manager_confidence: int

