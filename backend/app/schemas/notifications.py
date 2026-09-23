from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class NotificationItem(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    category: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationItem]
    unread_count: int
