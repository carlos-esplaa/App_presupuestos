from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import get_settings
from app.deps import get_db
from app.models import AppConfig
from app.schemas import RequisitionCreate, RequisitionOut
from app.services import gocardless, telegram

router = APIRouter(prefix="/setup", tags=["setup"])
settings = get_settings()


def _set_config(db: Session, key: str, value: str) -> None:
    row = db.query(AppConfig).filter(AppConfig.key == key).first()
    if row:
        row.value = value
    else:
        db.add(AppConfig(key=key, value=value))


def _get_config(db: Session, key: str) -> str:
    row = db.query(AppConfig).filter(AppConfig.key == key).first()
    return row.value if row else ""


@router.get("/institutions")
def list_institutions(country: str = "es", db: Session = Depends(get_db), _: str = Depends(get_current_user)):
    try:
        return gocardless.list_institutions(db, country)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/requisition", response_model=RequisitionOut)
def create_requisition(body: RequisitionCreate, db: Session = Depends(get_db), _: str = Depends(get_current_user)):
    # Usa la URL pública configurada en vez de localhost hardcodeado
    redirect_url = f"{settings.PUBLIC_URL}/api/setup/callback"
    try:
        data = gocardless.create_requisition(db, body.institution_id, redirect_url)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    req_id = data.get("id", "")
    link = data.get("link", "")
    _set_config(db, "gocardless_requisition_id", req_id)
    db.commit()
    return RequisitionOut(requisition_id=req_id, link=link)


@router.get("/callback")
def gocardless_callback(ref: str | None = None, db: Session = Depends(get_db)):
    """GoCardless redirige aquí tras la autorización del usuario — no requiere JWT."""
    req_id = _get_config(db, "gocardless_requisition_id")
    if not req_id:
        return {"status": "error", "detail": "No requisition found"}
    try:
        data = gocardless.get_requisition(db, req_id)
        accounts = data.get("accounts", [])
        if accounts:
            # Guarda todas las cuentas disponibles, no solo la primera
            for i, acc_id in enumerate(accounts):
                _set_config(db, f"gocardless_account_id_{i}", acc_id)
            # La cuenta principal (índice 0) se usa por defecto
            _set_config(db, "gocardless_account_id", accounts[0])
            db.commit()
            return {"status": "ok", "accounts": accounts}
        return {"status": "pending", "detail": "No accounts linked yet"}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


@router.get("/complete")
def setup_complete(db: Session = Depends(get_db), _: str = Depends(get_current_user)):
    account_id = _get_config(db, "gocardless_account_id")
    onboarding = _get_config(db, "onboarding_complete")
    return {
        "account_configured": bool(account_id),
        "account_id": account_id,
        "onboarding_complete": onboarding == "true",
    }


@router.get("/telegram-chat-id")
def get_telegram_chat_id(db: Session = Depends(get_db), _: str = Depends(get_current_user)):
    chat_id = telegram.get_chat_id_from_updates()
    if not chat_id:
        raise HTTPException(status_code=404, detail="No Telegram updates found. Send /start to your bot first.")
    _set_config(db, "telegram_chat_id", chat_id)
    db.commit()
    return {"chat_id": chat_id, "status": "saved"}
