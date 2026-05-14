from sqlalchemy.orm import Session
from app.models import Transaction


def transaction_exists(db: Session, transaction_id: str) -> bool:
    return db.query(Transaction).filter(Transaction.id == transaction_id).first() is not None


def filter_new_transactions(db: Session, transactions: list[dict]) -> tuple[list[dict], int]:
    new_txs = []
    duplicates = 0
    for tx in transactions:
        tx_id = tx.get("transactionId") or tx.get("internalTransactionId", "")
        if not tx_id or transaction_exists(db, tx_id):
            duplicates += 1
        else:
            new_txs.append(tx)
    return new_txs, duplicates
