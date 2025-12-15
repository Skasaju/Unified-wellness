from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/api/user", tags=["User"])


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    profile: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    if profile.name is not None:
        current_user.name = profile.name
    if profile.age is not None:
        current_user.age = profile.age
    if profile.height_cm is not None:
        current_user.height_cm = profile.height_cm
    if profile.weight_kg is not None:
        current_user.weight_kg = profile.weight_kg
    if profile.gender is not None:
        current_user.gender = profile.gender
    if profile.goals is not None:
        current_user.goals = profile.goals
    if profile.diet_type is not None:
        current_user.diet_type = profile.diet_type
    
    db.commit()
    db.refresh(current_user)
    
    return current_user
