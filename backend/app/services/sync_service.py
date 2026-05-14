import json
import logging
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Transaction, Category, AppConfig
from app.services import gocardless, classifier, budget_service, telegram
from app.utils.deduplication import filter_new_transactions

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_config(db: Session, key: str, default: str = "") -> str:
    row = db.query(AppConfig).filter(AppConfig.key == key).first()
    return row.value if row else default


def _set_config(db: Session, key: str, value: str) -> None:
    row = db.query(AppConfig).filter(AppConfig.key == key).first()
    if row:
        row.value = value
    else:
        db.add(AppConfig(key=key, value=value))


def _get_or_create_category(db: Session, name: str) -> Category:
    cat = db.query(Category).filter(Category.name == name).first()
    if not cat:
        cat = Category(name=name)
        db.add(cat)
        db.flush()
    return cat


def run_sync(db: Session) -> dict:
    synced = 0
    new_count = 0
    duplicate_count = 0
    errors: list[str] = []

    account_id = _get_config(db, "gocardless_account_id")
    if not account_id:
        return {"synced": 0, "new": 0, "duplicate": 0, "errors": ["No account_id configured. Run /api/setup/requisition first."]}

    try:
        date_from = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
        raw_txs = gocardless.fetch_transactions(db, account_id, date_from)
    except Exception as exc:
        logger.exception("GoCardless fetch failed")
        return {"synced": 0, "new": 0, "duplicate": 0, "errors": [str(exc)]}

    synced = len(raw_txs)
    new_txs, duplicate_count = filter_new_transactions(db, raw_txs)
    new_count = len(new_txs)

    chat_id = _get_config(db, "telegram_chat_id")

    for raw in new_txs:
        try:
            tx_id = raw.get("transactionId") or raw.get("internalTransactionId", "")
            amount_str = raw.get("transactionAmount", {}).get("amount", "0")
            amount = float(amount_str)
            currency = raw.get("transactionAmount", {}).get("currency", "EUR")
            description = (
                raw.get("remittanceInformationUnstructured")
                or raw.get("remittanceInformationStructured")
                or raw.get("creditorName")
                or ""
            )
            booking_date = raw.get("bookingDate", datetime.utcnow().strftime("%Y-%m-%d"))
            value_date = raw.get("valueDate")

            result = classifier.classify(amount, description, settings.SALARY_MIN_AMOUNT)
            cat = _get_or_create_category(db, result.category_name)

            # Handle salary → new cycle
            if result.tx_type == "income" and amount >= settings.SALARY_MIN_AMOUNT:
                cycle = budget_service.close_and_open_cycle(db, amount)
                telegram.notify_new_cycle(chat_id, amount)
            else:
                cycle = budget_service.get_current_cycle(db)

            tx = Transaction(
                id=tx_id,
                account_id=account_id,
                amount=amount,
                currency=currency,
                description=description,
                booking_date=booking_date,
                value_date=value_date,
                category_id=cat.id,
                budget_cycle_id=cycle.id if cycle else None,
                is_expense=result.is_expense,
                tx_type=result.tx_type,
                raw_json=json.dumps(raw),
            )
            db.add(tx)
            db.flush()

            if result.is_expense and abs(amount) >= settings.EXPENSE_ALERT_THRESHOLD:
                telegram.notify_large_expense(chat_id, description, amount, result.category_name)

        except Exception as exc:
            logger.exception("Error processing transaction %s", raw)
            errors.append(str(exc))

    db.commit()

    # Budget percentage alerts
    cycle = budget_service.get_current_cycle(db)
    if cycle and cycle.total_budget > 0:
        total_spent = budget_service.get_total_cycle_spending(db, cycle.id)
        pct = total_spent / cycle.total_budget

        for threshold, flag in [(0.5, "budget_alert_50_sent"), (0.8, "budget_alert_80_sent"), (1.0, "budget_alert_100_sent")]:
            if pct >= threshold and _get_config(db, flag) != "true":
                telegram.notify_budget_alert(chat_id, int(threshold * 100), total_spent, cycle.total_budget)
                _set_config(db, flag, "true")

        db.commit()

    return {"synced": synced, "new": new_count, "duplicate": duplicate_count, "errors": errors}
