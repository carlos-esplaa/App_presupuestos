from datetime import datetime, timedelta, timezone
import httpx
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import GocardlessToken

settings = get_settings()
BASE = settings.GOCARDLESS_BASE_URL


def _utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


# ── Token management ──────────────────────────────────────────────────────────

def _get_new_tokens(db: Session) -> GocardlessToken:
    resp = httpx.post(
        f"{BASE}/token/new/",
        json={"secret_id": settings.GOCARDLESS_SECRET_ID, "secret_key": settings.GOCARDLESS_SECRET_KEY},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    now = _utc_now()
    token = GocardlessToken(
        access_token=data["access"],
        refresh_token=data["refresh"],
        access_expires=now + timedelta(seconds=data["access_expires"]),
        refresh_expires=now + timedelta(seconds=data["refresh_expires"]),
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def _refresh_tokens(db: Session, token: GocardlessToken) -> GocardlessToken:
    resp = httpx.post(
        f"{BASE}/token/refresh/",
        json={"refresh": token.refresh_token},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    now = _utc_now()
    token.access_token = data["access"]
    token.access_expires = now + timedelta(seconds=data["access_expires"])
    db.commit()
    db.refresh(token)
    return token


def get_access_token(db: Session) -> str:
    token = db.query(GocardlessToken).order_by(GocardlessToken.id.desc()).first()
    now = _utc_now()

    if token is None:
        token = _get_new_tokens(db)
    elif token.refresh_expires < now:
        # Refresh expired — need full re-auth
        token = _get_new_tokens(db)
    elif token.access_expires < now + timedelta(seconds=60):
        token = _refresh_tokens(db, token)

    return token.access_token


# ── Institution & Requisition ─────────────────────────────────────────────────

def list_institutions(db: Session, country: str = "es") -> list[dict]:
    token = get_access_token(db)
    resp = httpx.get(
        f"{BASE}/institutions/?country={country}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def create_requisition(db: Session, institution_id: str, redirect_url: str) -> dict:
    token = get_access_token(db)
    resp = httpx.post(
        f"{BASE}/requisitions/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "redirect": redirect_url,
            "institution_id": institution_id,
            "reference": "finance-app-001",
            "language": "ES",
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def get_requisition(db: Session, requisition_id: str) -> dict:
    token = get_access_token(db)
    resp = httpx.get(
        f"{BASE}/requisitions/{requisition_id}/",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


# ── Transactions ──────────────────────────────────────────────────────────────

def fetch_transactions(db: Session, account_id: str, date_from: str) -> list[dict]:
    token = get_access_token(db)
    resp = httpx.get(
        f"{BASE}/accounts/{account_id}/transactions/",
        headers={"Authorization": f"Bearer {token}"},
        params={"date_from": date_from},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json().get("transactions", {})
    booked = data.get("booked", [])
    pending = data.get("pending", [])
    return booked + pending
