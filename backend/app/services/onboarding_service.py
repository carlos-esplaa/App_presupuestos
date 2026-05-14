from datetime import datetime, timedelta
from collections import defaultdict
from sqlalchemy.orm import Session

from app.models import Transaction, Category
from app.services import classifier
from app.config import get_settings

settings = get_settings()


def analyze_90_days(db: Session) -> dict:
    cutoff = (datetime.utcnow() - timedelta(days=90)).strftime("%Y-%m-%d")
    transactions = (
        db.query(Transaction)
        .filter(Transaction.booking_date >= cutoff)
        .all()
    )

    salary_amounts: list[float] = []
    category_monthly: dict[str, list[float]] = defaultdict(list)
    category_counts: dict[str, int] = defaultdict(int)
    monthly_by_cat: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))

    for tx in transactions:
        result = classifier.classify(tx.amount, tx.description, settings.SALARY_MIN_AMOUNT)
        month_key = tx.booking_date[:7]  # "YYYY-MM"

        if result.tx_type == "income" and tx.amount >= settings.SALARY_MIN_AMOUNT:
            salary_amounts.append(tx.amount)
        elif result.is_expense:
            monthly_by_cat[result.category_name][month_key] += abs(tx.amount)
            category_counts[result.category_name] += 1

    avg_salary = sum(salary_amounts) / len(salary_amounts) if salary_amounts else 0.0

    categories_out = []
    for cat_name, monthly_data in monthly_by_cat.items():
        months = list(monthly_data.values())
        avg_monthly = sum(months) / len(months) if months else 0.0
        suggested = round(avg_monthly * 1.1, 2)  # 10% buffer
        categories_out.append({
            "name": cat_name,
            "average_monthly": round(avg_monthly, 2),
            "suggested_limit": suggested,
            "transaction_count": category_counts[cat_name],
        })

    categories_out.sort(key=lambda x: x["average_monthly"], reverse=True)

    return {
        "days_analyzed": 90,
        "average_salary": round(avg_salary, 2),
        "total_transactions": len(transactions),
        "suggested_budget": round(avg_salary, 2),
        "categories": categories_out,
    }
