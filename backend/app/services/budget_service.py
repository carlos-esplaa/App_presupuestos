from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import BudgetCycle, Transaction, AppConfig, Category


def get_current_cycle(db: Session) -> BudgetCycle | None:
    return (
        db.query(BudgetCycle)
        .filter(BudgetCycle.ended_at.is_(None))
        .order_by(BudgetCycle.started_at.desc())
        .first()
    )


def close_and_open_cycle(db: Session, salary_amount: float) -> BudgetCycle:
    existing = get_current_cycle(db)
    if existing:
        existing.ended_at = datetime.utcnow()

    new_cycle = BudgetCycle(
        started_at=datetime.utcnow(),
        salary_amount=salary_amount,
        total_budget=salary_amount,
    )
    db.add(new_cycle)

    for flag in ("budget_alert_50_sent", "budget_alert_80_sent", "budget_alert_100_sent"):
        _set_config(db, flag, "false")

    db.commit()
    db.refresh(new_cycle)
    return new_cycle


def get_cycle_spending_by_category(db: Session, cycle_id: int) -> dict[int, float]:
    rows = (
        db.query(Transaction.category_id, func.sum(func.abs(Transaction.amount)))
        .filter(
            Transaction.budget_cycle_id == cycle_id,
            Transaction.is_expense.is_(True),
        )
        .group_by(Transaction.category_id)
        .all()
    )
    return {cat_id: total for cat_id, total in rows if cat_id is not None}


def get_total_cycle_spending(db: Session, cycle_id: int) -> float:
    result = (
        db.query(func.sum(func.abs(Transaction.amount)))
        .filter(
            Transaction.budget_cycle_id == cycle_id,
            Transaction.is_expense.is_(True),
        )
        .scalar()
    )
    return result or 0.0


def get_config(db: Session, key: str, default: str = "") -> str:
    row = db.query(AppConfig).filter(AppConfig.key == key).first()
    return row.value if row else default


def _set_config(db: Session, key: str, value: str) -> None:
    row = db.query(AppConfig).filter(AppConfig.key == key).first()
    if row:
        row.value = value
    else:
        db.add(AppConfig(key=key, value=value))
