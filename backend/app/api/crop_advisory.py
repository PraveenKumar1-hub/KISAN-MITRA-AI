from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.crop_advisory import CropAdvisoryResponse, CropAdvisoryRequest
from app.services.crop_recommendation import generate_crop_recommendations

router = APIRouter(prefix="/api/crop-advisory", tags=["Crop Advisory"])

@router.post("/recommend", response_model=CropAdvisoryResponse)
def get_recommendations(
    request_data: Optional[CropAdvisoryRequest] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Generate deterministic, rule-based crop recommendations based on
    the farmer's provided or registered profile parameters.
    """
    # 1. Resolve parameters (if field is explicitly specified in request, use it; otherwise fallback to profile)
    if request_data and request_data.soil_type is not None:
        eff_soil = request_data.soil_type.strip()
    else:
        eff_soil = (current_user.soil_type or "").strip()

    if request_data and request_data.location is not None:
        eff_loc = request_data.location.strip()
    else:
        eff_loc = (current_user.location or "").strip()

    if request_data and request_data.farm_size is not None:
        eff_size = request_data.farm_size.strip()
    else:
        eff_size = (current_user.farm_size or "").strip()

    if request_data and request_data.irrigation_type is not None:
        eff_irr = request_data.irrigation_type.strip()
    else:
        eff_irr = (current_user.irrigation_type or "").strip()

    if request_data and request_data.primary_crop is not None:
        eff_crop = request_data.primary_crop.strip()
    else:
        eff_crop = (current_user.primary_crop or "").strip()

    # 2. Validation
    if not eff_soil:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Soil type is required to generate crop recommendations."
        )

    if not eff_loc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location is required to generate crop recommendations."
        )

    if eff_size:
        clean_size = eff_size.split()[0]
        try:
            val = float(clean_size)
            if val <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Farm size must be a positive number."
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Farm size must be a valid positive number."
            )

    results = generate_crop_recommendations(
        user=current_user,
        soil_type=eff_soil,
        irrigation_type=eff_irr,
        location=eff_loc,
        primary_crop=eff_crop,
        farm_size=eff_size
    )
    return results
