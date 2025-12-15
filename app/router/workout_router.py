from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.health import Workout
from schemas.workout import WorkoutCreate, WorkoutResponse

router = APIRouter(prefix="/api/workouts", tags=["Workouts"])


@router.get("", response_model=List[WorkoutResponse])
def get_workouts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all workouts for current user.
    """
    workouts = db.query(Workout)\
        .filter(Workout.user_id == current_user.id)\
        .order_by(Workout.date.desc())\
        .all()
    
    return workouts


@router.post("", response_model=WorkoutResponse)
def create_workout(
    workout_data: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new workout entry.
    """
    workout = Workout(
        user_id=current_user.id,
        type=workout_data.type,
        duration_min=workout_data.duration_min,
        calories_burned=workout_data.calories_burned,
        date=workout_data.date or datetime.now().date()
    )
    
    db.add(workout)
    db.commit()
    db.refresh(workout)
    
    return workout