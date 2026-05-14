from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_db
from app.schemas import SyncResult
from app.services.sync_service import run_sync

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("", response_model=SyncResult)
def force_sync(db: Session = Depends(get_db)):
    return run_sync(db)
