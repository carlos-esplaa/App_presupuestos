from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str
    color: str = "#6366f1"
    icon: str = "tag"
    budget_limit: float = 0.0


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int
    is_system: bool
    spent: float = 0.0
    percent: float = 0.0

    model_config = {"from_attributes": True}


class BudgetCategoryOut(BaseModel):
    id: int
    name: str
    color: str
    icon: str
    budget_limit: float
    spent: float
    percent: float


class BudgetCurrentOut(BaseModel):
    cycle_id: Optional[int]
    started_at: Optional[datetime]
    total_budget: float
    total_spent: float
    remaining: float
    percent_used: float
    days_elapsed: int
    categories: list[BudgetCategoryOut]


class TransactionOut(BaseModel):
    id: str
    amount: float
    currency: str
    description: str
    booking_date: str
    category_id: Optional[int]
    category_name: Optional[str]
    category_color: Optional[str]
    is_expense: bool
    tx_type: str

    model_config = {"from_attributes": True}


class TransactionListOut(BaseModel):
    total: int
    items: list[TransactionOut]


class SyncResult(BaseModel):
    synced: int
    new: int
    duplicate: int
    errors: list[str]


class OnboardingCategoryOut(BaseModel):
    name: str
    average_monthly: float
    suggested_limit: float
    transaction_count: int


class OnboardingAnalysisOut(BaseModel):
    days_analyzed: int
    average_salary: float
    total_transactions: int
    suggested_budget: float
    categories: list[OnboardingCategoryOut]


class RequisitionCreate(BaseModel):
    institution_id: str


class RequisitionOut(BaseModel):
    requisition_id: str
    link: str
