"""
Plant Health Image Processing Pipeline and Orchestration Service.
Validates uploaded leaf images, normalizes dimensions, and coordinates with
PlantDiseaseModelEngine for inference.
"""

import io
from typing import Dict, Any
from PIL import Image
from app.services.disease_model import disease_model_engine


class PlantHealthService:
    """
    Image validation and preprocessing pipeline.
    Validates integrity, normalizes dimensions, delegates to disease_model_engine,
    and returns structured agricultural advisory.
    """
    ALLOWED_FORMATS = {"JPEG", "JPG", "PNG"}
    MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

    @classmethod
    def get_model_metadata(cls) -> Dict[str, Any]:
        """Returns model status and configuration metadata."""
        return disease_model_engine.get_model_info()

    @classmethod
    def validate_and_process(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Validates the uploaded file is a real, readable image, normalizes it,
        and queries the prediction interface.
        Temporary processing is performed entirely in memory to maintain farmer privacy.
        """
        # 1. Check byte size
        if len(file_bytes) == 0:
            raise ValueError("Uploaded file is empty.")

        if len(file_bytes) > cls.MAX_FILE_SIZE_BYTES:
            raise ValueError("Image size exceeds the 5 MB limit.")

        # 2. Validate real readable image using PIL
        try:
            image = Image.open(io.BytesIO(file_bytes))
            image.verify()  # Fast structural verification
        except Exception:
            raise ValueError("The uploaded file is corrupted or not a valid readable image.")

        # Reopen after verify() as recommended by PIL docs
        image = Image.open(io.BytesIO(file_bytes))
        image_format = (image.format or "JPEG").upper()
        if image_format == "JPG":
            image_format = "JPEG"

        if image_format not in cls.ALLOWED_FORMATS:
            raise ValueError(f"Unsupported image format: {image_format}. Please upload a JPG, JPEG, or PNG image.")

        width, height = image.size
        size_kb = round(len(file_bytes) / 1024, 1)

        image_details = {
            "filename": filename,
            "format": image_format,
            "width": width,
            "height": height,
            "size_kb": size_kb
        }

        # 3. Model metadata
        model_info = disease_model_engine.get_model_info()

        # 4. Check model availability
        if not disease_model_engine.is_available():
            return {
                "status": "model_unavailable",
                "message": "Plant disease detection model is currently unavailable.",
                "image_valid": True,
                "image_details": image_details,
                "result": None,
                "model_info": model_info
            }

        # 5. Run inference via decoupled model engine
        prediction = disease_model_engine.predict(image)

        if prediction is None:
            return {
                "status": "model_unavailable",
                "message": "Plant disease detection model is currently unavailable.",
                "image_valid": True,
                "image_details": image_details,
                "result": None,
                "model_info": model_info
            }

        status = prediction.get("status", "success")
        message = (
            "Low-confidence result: please upload a clearer image or consult an agricultural expert."
            if status == "low_confidence"
            else "Analysis completed successfully."
        )

        return {
            "status": status,
            "message": message,
            "image_valid": True,
            "image_details": image_details,
            "result": prediction,
            "model_info": model_info
        }
