from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.market import MarketPriceResponse
from app.services.market_service import fetch_market_prices

router = APIRouter(prefix="/api/market-prices", tags=["Market Prices"])


@router.get("", response_model=MarketPriceResponse)
def get_market_prices(
    crop: Optional[str] = Query(None, description="Crop or commodity name"),
    location: Optional[str] = Query(None, description="State, district, or mandi location"),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch agricultural mandi prices from official sources (data.gov.in / Agmarknet).
    Uses the authenticated farmer's primary crop as default if crop parameter is omitted.
    """
    user_crop = getattr(current_user, "primary_crop", None)
    return fetch_market_prices(
        crop=crop,
        location=location,
        user_crop=user_crop
    )
