from typing import List, Optional
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Farmer's agricultural query (max 2000 characters)"
    )

class ChatResponse(BaseModel):
    success: bool
    answer: str
    language: str
    sources: List[str] = []
    message: Optional[str] = None
