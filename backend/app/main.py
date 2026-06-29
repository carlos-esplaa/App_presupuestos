import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine
from app.models import Base

logging.basicConfig(level=logging.INFO)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _seed_default_data()

    from app.scheduler import start_scheduler, stop_scheduler
    start_scheduler()
    yield
    stop_scheduler()


def _seed_default_data() -> None:
    from app.database import SessionLocal
    from app.models import Category, AppConfig

    default_categories = [
        {"name": "Salary", "color": "#22c55e", "icon": "banknote", "budget_limit": 0.0, "is_system": True},
        {"name": "Savings", "color": "#6366f1", "icon": "piggy-bank", "budget_limit": 0.0, "is_system": True},
        {"name": "Alimentación", "color": "#f59e0b", "icon": "shopping-cart", "budget_limit": 400.0, "is_system": False},
        {"name": "Transporte", "color": "#3b82f6", "icon": "car", "budget_limit": 150.0, "is_system": False},
        {"name": "Ocio", "color": "#ec4899", "icon": "gamepad-2", "budget_limit": 200.0, "is_system": False},
        {"name": "Hogar", "color": "#14b8a6", "icon": "home", "budget_limit": 300.0, "is_system": False},
        {"name": "Salud", "color": "#ef4444", "icon": "heart-pulse", "budget_limit": 100.0, "is_system": False},
        {"name": "Otros", "color": "#94a3b8", "icon": "tag", "budget_limit": 0.0, "is_system": False},
    ]

    default_config = [
        ("onboarding_complete", "false"),
        ("gocardless_requisition_id", ""),
        ("gocardless_account_id", ""),
        ("telegram_chat_id", ""),
        ("budget_alert_50_sent", "false"),
        ("budget_alert_80_sent", "false"),
        ("budget_alert_100_sent", "false"),
    ]

    db = SessionLocal()
    try:
        for cat_data in default_categories:
            if not db.query(Category).filter(Category.name == cat_data["name"]).first():
                db.add(Category(**cat_data))

        for key, value in default_config:
            if not db.query(AppConfig).filter(AppConfig.key == key).first():
                db.add(AppConfig(key=key, value=value))

        db.commit()
    finally:
        db.close()


app = FastAPI(title="Presupuesto Personal API", version="1.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.auth import router as auth_router  # noqa: E402
from app.routers import budget, transactions, categories, sync, onboarding, setup  # noqa: E402

app.include_router(auth_router, prefix="/api")
app.include_router(budget.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(sync.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(setup.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "service": "Presupuesto Personal API", "version": "1.1.0"}
