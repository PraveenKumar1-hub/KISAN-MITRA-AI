from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.farm import FarmResponse, FarmUpdateRequest

router = APIRouter(prefix="/api/farm", tags=["My Farm"])


@router.get("", response_model=FarmResponse)
def get_farm_details(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated farmer's registered parcel details and configuration.
    """
    return current_user


@router.put("", response_model=FarmResponse)
def update_farm_details(
    payload: FarmUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the authenticated farmer's parcel characteristics in the database.
    Only allows users to update their own farm information.
    """
    # 1. Validate farm size if provided
    if payload.farm_size is not None:
        clean_size = str(payload.farm_size).strip()
        if not clean_size:
            raise HTTPException(status_code=400, detail="Farm Size cannot be empty")
        try:
            numeric_size = float(clean_size.split()[0])
            if numeric_size <= 0:
                raise HTTPException(status_code=400, detail="Farm Size must be a positive number")
            current_user.farm_size = clean_size
        except (ValueError, IndexError):
            raise HTTPException(status_code=400, detail="Farm Size must be a valid positive number")

    # 2. Validate location if provided
    if payload.location is not None:
        clean_loc = str(payload.location).strip()
        if not clean_loc:
            raise HTTPException(status_code=400, detail="Location cannot be empty")
        current_user.location = clean_loc

    # 3. Update optional parameters
    if payload.soil_type is not None:
        current_user.soil_type = str(payload.soil_type).strip() if str(payload.soil_type).strip() else None

    if payload.irrigation_type is not None:
        current_user.irrigation_type = str(payload.irrigation_type).strip() if str(payload.irrigation_type).strip() else None

    if payload.primary_crop is not None:
        current_user.primary_crop = str(payload.primary_crop).strip() if str(payload.primary_crop).strip() else None

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return current_user
