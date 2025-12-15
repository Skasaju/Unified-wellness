from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.health import Sleep
from schemas.health import SleepCreate, SleepResponse

router = APIRouter(prefix="/api/sleep", tags=["Sleep"])


@router.get("", response_model=List[SleepResponse])
def get_sleep(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all sleep records for current user.
    """
    sleep_records = db.query(Sleep)\
        .filter(Sleep.user_id == current_user.id)\
        .order_by(Sleep.date.desc())\
        .all()
    
    return sleep_records


@router.post("", response_model=SleepResponse)
def create_sleep(
    sleep_data: SleepCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new sleep record.
    """
    sleep = Sleep(
        user_id=current_user.id,
        hours=sleep_data.hours,
        quality=sleep_data.quality,
        date=sleep_data.date or datetime.now().date()
    )
    
    db.add(sleep)
    db.commit()
    db.refresh(sleep)
    
    return sleep