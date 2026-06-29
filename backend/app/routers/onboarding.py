from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.deps import get_db
from app.schemas import OnboardingAnalysisOut
from app.services.onboarding_service import analyze_90_days

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("/analysis", response_model=OnboardingAnalysisOut)
def onboarding_analysis(db: Session = Depends(get_db), _: str = Depends(get_current_user)):
    return analyze_90_days(db)
