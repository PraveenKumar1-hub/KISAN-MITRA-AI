from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.insights import FarmIntelligenceResponse
from app.services.insights_service import generate_farm_intelligence

router = APIRouter(prefix="/api/insights", tags=["Farm Intelligence & AI Insights"])


@router.get("", response_model=FarmIntelligenceResponse)
def get_farm_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the centralized Farm Intelligence summary and prioritized insights
    for the authenticated farmer by orchestrating active domain services
    (Weather, Smart Irrigation, Crop Advisory, Plant Health, Market).
    """
    return generate_farm_intelligence(user=current_user, db=db)
