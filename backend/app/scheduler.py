import logging
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.config import get_settings
from app.database import SessionLocal

logger = logging.getLogger(__name__)
settings = get_settings()
scheduler = BackgroundScheduler()


def _sync_job() -> None:
    from app.services.sync_service import run_sync
    db = SessionLocal()
    try:
        result = run_sync(db)
        logger.info("Scheduled sync complete: %s", result)
    except Exception:
        logger.exception("Scheduled sync failed")
    finally:
        db.close()


def start_scheduler() -> None:
    scheduler.add_job(
        func=_sync_job,
        trigger=IntervalTrigger(hours=settings.SYNC_INTERVAL_HOURS),
        id="bank_sync",
        replace_existing=True,
        next_run_time=datetime.now(),
    )
    scheduler.start()
    logger.info("Scheduler started (interval: %sh)", settings.SYNC_INTERVAL_HOURS)


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
