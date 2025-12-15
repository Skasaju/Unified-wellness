from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import httpx
import base64
import json

from core.database import get_db
from core.config import settings
from core.dependencies import get_current_user
from models.user import User
from models.health import Nutrition
from schemas.nutrition import NutritionCreate, NutritionResponse

router = APIRouter(prefix="/api/nutrition", tags=["Nutrition"])


@router.get("", response_model=List[NutritionResponse])
def get_nutrition(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all nutrition records for current user.
    """
    nutrition = db.query(Nutrition)\
        .filter(Nutrition.user_id == current_user.id)\
        .order_by(Nutrition.date.desc())\
        .all()
    
    return nutrition


@router.post("", response_model=NutritionResponse)
def create_nutrition(
    nutrition_data: NutritionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new nutrition record.
    """
    nutrition = Nutrition(
        user_id=current_user.id,
        food_name=nutrition_data.food_name,
        calories=nutrition_data.calories,
        protein=nutrition_data.protein,
        carbs=nutrition_data.carbs,
        fats=nutrition_data.fats,
        date=datetime.now()
    )
    
    db.add(nutrition)
    db.commit()
    db.refresh(nutrition)
    
    return nutrition