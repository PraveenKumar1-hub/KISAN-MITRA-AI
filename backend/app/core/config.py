import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kisan Mitra AI API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kisan_mitra.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_change_in_production_1234567890")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

