from fastapi import APIRouter, Depends, HTTPException, status
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.weather import WeatherResponse
from app.services.weather_service import fetch_weather_for_location

router = APIRouter(prefix="/api/weather", tags=["Weather Intelligence"])

@router.get("/current", response_model=WeatherResponse)
def get_current_weather(current_user: User = Depends(get_current_user)):
    """
    Fetches real weather intelligence for the authenticated farmer's registered location.
    Converts location into coordinates, queries Open-Meteo, and generates agricultural insights.
    """
    user_location = getattr(current_user, "location", None)

    if not user_location or not str(user_location).strip():
        return {
            "success": False,
            "error_type": "missing_location",
            "message": "Please update your farm location to view local weather."
        }

    weather_data = fetch_weather_for_location(str(user_location).strip())
    return weather_data
