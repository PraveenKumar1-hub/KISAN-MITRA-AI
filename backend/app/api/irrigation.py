from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.irrigation import IrrigationAdvisoryResponse
from app.services.irrigation_service import generate_irrigation_advisory

router = APIRouter(prefix="/api/irrigation", tags=["Smart Irrigation"])

@router.get("/advisory", response_model=IrrigationAdvisoryResponse)
def get_irrigation_advisory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates real weather data and farmer profile parameters to return
    a deterministic, rule-based irrigation recommendation.
    """
    result = generate_irrigation_advisory(user=current_user, db=db)
    return result
