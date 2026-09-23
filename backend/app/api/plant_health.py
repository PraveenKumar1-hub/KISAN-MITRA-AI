from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.plant_health import PlantHealthAnalysisResponse, ModelMetadata
from app.services.plant_health import PlantHealthService

router = APIRouter(prefix="/api/plant-health", tags=["Plant Health"])

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/pjpeg",
    "image/x-png"
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.get("/model-info", response_model=ModelMetadata)
def get_plant_disease_model_info(
    current_user: User = Depends(get_current_user)
):
    """
    Returns live model status, architecture type, confidence threshold, and supported image formats.
    """
    return PlantHealthService.get_model_metadata()


@router.post("/analyze", response_model=PlantHealthAnalysisResponse)
async def analyze_plant_health(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Authenticated image analysis endpoint for plant disease detection.
    Validates uploaded crop leaf image format, integrity, and executes forward-pass inference.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded. Please select an image."
        )

    # 1. Validate MIME type
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a JPG, JPEG, or PNG image."
        )

    # 2. Read file bytes
    try:
        file_bytes = await file.read()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read uploaded image."
        )

    # 3. Check file size (413 if too large)
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size exceeds the 5 MB limit. Please upload a smaller image."
        )

    # 4. Process via pipeline
    try:
        response_data = PlantHealthService.validate_and_process(
            file_bytes=file_bytes,
            filename=file.filename or "leaf.jpg"
        )
        return response_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"[PlantHealthAPI] Processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the plant image. Please try again."
        )
