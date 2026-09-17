from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str
    location: str
    farm_size: str
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    primary_crop: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    location: str
    farm_size: str
    soil_type: Optional[str]
    irrigation_type: Optional[str]
    primary_crop: Optional[str]
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
