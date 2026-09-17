from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth
from app.db.database import engine, Base
from app.db import models  # noqa: F401 - ensure models are registered with Base metadata
from app.core.config import settings
import logging

# Ensure SQLite / DB tables are automatically initialized on startup
try:
    Base.metadata.create_all(bind=engine)
    logging.info("Database tables initialized successfully.")
except Exception as e:
    logging.error(f"Error creating tables: {e}")

app = FastAPI(title=settings.PROJECT_NAME)

origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
# Remove duplicates while preserving order
unique_origins = list(dict.fromkeys(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=unique_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Welcome to Kisan Mitra AI API", "status": "online"}

