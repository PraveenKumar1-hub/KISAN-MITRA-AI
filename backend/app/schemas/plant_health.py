from typing import Optional, List
from pydantic import BaseModel

class ImageDetails(BaseModel):
    filename: str
    format: str
    width: int
    height: int
    size_kb: float

class DiseaseAdvisory(BaseModel):
    symptoms: Optional[str] = None
    prevention: Optional[str] = None
    general_management: Optional[str] = None
    treatment_guidance: Optional[str] = None
    severity: Optional[str] = None

class PlantDiseasePrediction(BaseModel):
    status: str
    plant: str
    disease: str
    confidence: float
    recommendation: str
    advisory: Optional[DiseaseAdvisory] = None

class ModelMetadata(BaseModel):
    model_available: bool
    model_type: str
    model_path: str
    confidence_threshold: float
    input_resolution: str
    supported_formats: List[str]
    max_file_size_mb: float

class PlantHealthAnalysisResponse(BaseModel):
    status: str  # "success" | "model_unavailable" | "low_confidence" | "invalid_image" | "processing_error"
    message: str
    image_valid: bool
    image_details: Optional[ImageDetails] = None
    result: Optional[PlantDiseasePrediction] = None
    model_info: Optional[ModelMetadata] = None
