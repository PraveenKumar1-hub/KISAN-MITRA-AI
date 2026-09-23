from pydantic import BaseModel
from typing import List, Optional

class CropAdvisoryRequest(BaseModel):
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    location: Optional[str] = None
    farm_size: Optional[str] = None
    primary_crop: Optional[str] = None

class RecommendationItem(BaseModel):
    crop: str
    match_score: int
    confidence: str
    reasons: List[str]
    water_requirement: str
    season: Optional[str] = None
    cultivation_note: str

class InputSummary(BaseModel):
    farmer_name: str
    location: str
    farm_size: str
    soil_type: str
    irrigation_type: str
    primary_crop: str

class CropAdvisoryResponse(BaseModel):
    success: bool
    recommendations: List[RecommendationItem]
    input_summary: InputSummary
    missing_parameters: List[str]
    notes: Optional[str] = None
