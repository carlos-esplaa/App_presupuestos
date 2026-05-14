from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.deps import get_db
from app.models import Transaction
from app.schemas import TransactionListOut, TransactionOut

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=TransactionListOut)
def list_transactions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    category_id: int | None = Query(None),
    tx_type: str | None = Query(None, alias="type"),
    db: Session = Depends(get_db),
):
    q = db.query(Transaction).options(joinedload(Transaction.category))

    if category_id is not None:
        q = q.filter(Transaction.category_id == category_id)
    if tx_type:
        q = q.filter(Transaction.tx_type == tx_type)

    total = q.count()
    items = q.order_by(Transaction.booking_date.desc()).offset(offset).limit(limit).all()

    out = []
    for tx in items:
        out.append(TransactionOut(
            id=tx.id,
            amount=tx.amount,
            currency=tx.currency,
            description=tx.description,
            booking_date=tx.booking_date,
            category_id=tx.category_id,
            category_name=tx.category.name if tx.category else None,
            category_color=tx.category.color if tx.category else None,
            is_expense=tx.is_expense,
            tx_type=tx.tx_type,
        ))

    return TransactionListOut(total=total, items=out)
