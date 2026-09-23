from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.database import get_db
from app.db.models import User, Notification
from app.core.security import get_current_user
from app.schemas.notifications import NotificationListResponse, NotificationItem

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves notifications for the authenticated farmer from the SQLite database.
    Strictly isolated: users can only view their own notifications.
    Returns honest empty array if no notifications exist. Zero fake notifications.
    """
    records = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    unread_count = sum(1 for n in records if not n.is_read)

    return {
        "notifications": records,
        "unread_count": unread_count
    }


@router.patch("/{notification_id}/read", response_model=NotificationItem)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marks a single notification as read.
    Validates ownership to prevent unauthorized access.
    """
    item = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    item.is_read = True
    db.commit()
    db.refresh(item)

    return item


@router.post("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Marks all notifications for the authenticated farmer as read.
    """
    (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)
        .update({"is_read": True})
    )
    db.commit()

    return {"success": True, "message": "All notifications marked as read"}
