from pydantic import BaseModel
from typing import Optional


class FarmResponse(BaseModel):
    full_name: str
    farm_size: str
    location: str
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    primary_crop: Optional[str] = None

    class Config:
        from_attributes = True


class FarmUpdateRequest(BaseModel):
    farm_size: Optional[str] = None
    location: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    primary_crop: Optional[str] = None
