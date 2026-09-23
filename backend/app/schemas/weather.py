from pydantic import BaseModel
from typing import List, Optional

class Coordinates(BaseModel):
    latitude: float
    longitude: float

class CurrentWeather(BaseModel):
    temperature: float
    apparent_temperature: float
    humidity: int
    rainfall: float
    wind_speed: float
    weather_code: int
    weather_condition: str

class ForecastItem(BaseModel):
    date: str
    day_index: int
    temp_max: Optional[float] = None
    temp_min: Optional[float] = None
    weather_code: int
    weather_condition: str
    precipitation_sum: float
    precipitation_probability: int

class WeatherResponse(BaseModel):
    success: bool
    location: Optional[str] = None
    resolved_location: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    current: Optional[CurrentWeather] = None
    forecast: Optional[List[ForecastItem]] = None
    farming_insights: Optional[List[str]] = None
    irrigation_advisory: Optional[str] = None
    updated_at: Optional[str] = None
    error_type: Optional[str] = None
    message: Optional[str] = None
