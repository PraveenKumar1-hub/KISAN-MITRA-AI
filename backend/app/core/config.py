import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kisan Mitra AI API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kisan_mitra.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_change_in_production_1234567890")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    DATA_GOV_IN_API_KEY: str = os.getenv("DATA_GOV_IN_API_KEY", "")
    MANDI_API_URL: str = os.getenv(
        "MANDI_API_URL",
        "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    )
    AI_API_KEY: str = os.getenv("AI_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    PLANT_DISEASE_MODEL_PATH: str = os.getenv(
        "PLANT_DISEASE_MODEL_PATH",
        "models/plant_disease/model.keras"
    )
    PLANT_DISEASE_LABELS_PATH: str = os.getenv(
        "PLANT_DISEASE_LABELS_PATH",
        "app/config/disease_labels.json"
    )
    PLANT_DISEASE_CONFIDENCE_THRESHOLD: float = float(
        os.getenv("PLANT_DISEASE_CONFIDENCE_THRESHOLD", "0.65")
    )
    PLANT_DISEASE_INPUT_SIZE: int = int(
        os.getenv("PLANT_DISEASE_INPUT_SIZE", "224")
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

