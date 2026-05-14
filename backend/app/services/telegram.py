import httpx
from app.config import get_settings

settings = get_settings()
_BASE = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}"


def _send(chat_id: str, text: str) -> None:
    if not chat_id or not settings.TELEGRAM_BOT_TOKEN:
        return
    try:
        httpx.post(
            f"{_BASE}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=10,
        )
    except Exception:
        pass


def notify_new_cycle(chat_id: str, salary_amount: float) -> None:
    _send(chat_id, f"💰 *Nómina detectada:* {salary_amount:,.2f}€\nNuevo ciclo de presupuesto iniciado.")


def notify_large_expense(chat_id: str, description: str, amount: float, category: str) -> None:
    _send(
        chat_id,
        f"⚠️ *Gasto elevado detectado*\n"
        f"📌 {description}\n"
        f"💶 {abs(amount):,.2f}€ en *{category}*",
    )


def notify_budget_alert(chat_id: str, percent: int, spent: float, total: float) -> None:
    emoji = "🟡" if percent < 100 else "🔴"
    _send(
        chat_id,
        f"{emoji} *Alerta de presupuesto: {percent}%*\n"
        f"Has gastado {spent:,.2f}€ de {total:,.2f}€ este ciclo.",
    )


def get_chat_id_from_updates() -> str | None:
    if not settings.TELEGRAM_BOT_TOKEN:
        return None
    try:
        resp = httpx.get(f"{_BASE}/getUpdates", timeout=10)
        data = resp.json()
        updates = data.get("result", [])
        if updates:
            return str(updates[-1]["message"]["from"]["id"])
    except Exception:
        pass
    return None
