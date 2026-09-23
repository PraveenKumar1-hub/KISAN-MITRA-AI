from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import generate_ai_chat_response

router = APIRouter(prefix="/api/ai", tags=["AI Agricultural Assistant"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Conversational agricultural assistant endpoint.
    Accepts farmer's questions, injects farm profile & live agro-meteorological context,
    and returns localized guidance in English, Hindi, or Hinglish.
    """
    result = generate_ai_chat_response(
        message=request.message,
        user=current_user,
        db=db
    )
    return result
