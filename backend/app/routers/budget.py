from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import Category
from app.schemas import BudgetCurrentOut, BudgetCategoryOut
from app.services.budget_service import (
    get_current_cycle,
    get_cycle_spending_by_category,
    get_total_cycle_spending,
)

router = APIRouter(prefix="/budget", tags=["budget"])


@router.get("/current", response_model=BudgetCurrentOut)
def current_budget(db: Session = Depends(get_db)):
    cycle = get_current_cycle(db)
    categories = db.query(Category).all()

    if not cycle:
        cat_out = [
            BudgetCategoryOut(id=c.id, name=c.name, color=c.color, icon=c.icon,
                              budget_limit=c.budget_limit, spent=0.0, percent=0.0)
            for c in categories
        ]
        return BudgetCurrentOut(
            cycle_id=None, started_at=None, total_budget=0.0,
            total_spent=0.0, remaining=0.0, percent_used=0.0,
            days_elapsed=0, categories=cat_out,
        )

    spending = get_cycle_spending_by_category(db, cycle.id)
    total_spent = get_total_cycle_spending(db, cycle.id)
    total_budget = cycle.total_budget
    remaining = max(0.0, total_budget - total_spent)
    percent_used = round((total_spent / total_budget * 100) if total_budget > 0 else 0.0, 1)
    days_elapsed = (datetime.utcnow() - cycle.started_at).days

    cat_out = []
    for c in categories:
        if c.is_system:
            continue
        spent = spending.get(c.id, 0.0)
        pct = round((spent / c.budget_limit * 100) if c.budget_limit > 0 else 0.0, 1)
        cat_out.append(BudgetCategoryOut(
            id=c.id, name=c.name, color=c.color, icon=c.icon,
            budget_limit=c.budget_limit, spent=round(spent, 2), percent=pct,
        ))

    return BudgetCurrentOut(
        cycle_id=cycle.id,
        started_at=cycle.started_at,
        total_budget=total_budget,
        total_spent=round(total_spent, 2),
        remaining=round(remaining, 2),
        percent_used=percent_used,
        days_elapsed=days_elapsed,
        categories=cat_out,
    )
