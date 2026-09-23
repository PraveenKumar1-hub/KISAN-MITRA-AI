from pydantic import BaseModel
from typing import List, Optional

class FarmSummary(BaseModel):
    crop: str
    soil_type: str
    irrigation_type: str
    farm_size: str
    location: str

class WeatherSummary(BaseModel):
    temperature: float
    humidity: int
    rainfall: float
    wind_speed: float
    rain_probability: int
    expected_rainfall_48h: float
    weather_condition: str

class IrrigationHistoryItem(BaseModel):
    id: int
    status: str
    status_label: str
    recommendation: str
    priority: str
    created_at: str

class IrrigationAdvisoryResponse(BaseModel):
    success: bool
    status: str
    status_label: str
    priority: str
    recommendation: str
    reasons: List[str]
    farm_summary: FarmSummary
    weather_summary: Optional[WeatherSummary] = None
    missing_parameters: List[str] = []
    history: List[IrrigationHistoryItem] = []
    generated_at: Optional[str] = None
