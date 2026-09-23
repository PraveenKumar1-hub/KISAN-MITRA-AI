from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.config import settings
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. Validate required fields
    if not user_data.full_name or not user_data.full_name.strip():
        raise HTTPException(status_code=400, detail="Full Name is required")

    if not user_data.location or not user_data.location.strip():
        raise HTTPException(status_code=400, detail="Location is required")

    if not user_data.farm_size or not str(user_data.farm_size).strip():
        raise HTTPException(status_code=400, detail="Farm Size is required")

    clean_size_str = str(user_data.farm_size).strip()
    try:
        size_numeric = float(clean_size_str.split()[0])
        if size_numeric <= 0:
            raise HTTPException(status_code=400, detail="Farm Size must be a positive number")
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Farm Size must be a valid positive number")

    if len(user_data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    if user_data.password != user_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    clean_email = str(user_data.email).strip().lower()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        full_name=user_data.full_name.strip(),
        email=clean_email,
        password_hash=hashed_password,
        location=user_data.location.strip(),
        farm_size=clean_size_str,
        soil_type=user_data.soil_type.strip() if user_data.soil_type else None,
        irrigation_type=user_data.irrigation_type.strip() if user_data.irrigation_type else None,
        primary_crop=user_data.primary_crop.strip() if user_data.primary_crop else None
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=Token)
def login(form_data: UserLogin, db: Session = Depends(get_db)):
    clean_email = str(form_data.email).strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
