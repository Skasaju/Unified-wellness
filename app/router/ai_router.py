from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from services.ai_service import analyze_food_image, generate_workout_plan

router = APIRouter(prefix="/api/ai", tags=["AI Services"])


@router.post("/nutrition-image")
async def analyze_food(
    file: UploadFile = File(...)
):
    """Analyze food image using AI"""
    result = await analyze_food_image(file)
    return result


@router.post("/workout-plan")
async def create_workout_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate personalized AI workout plan"""
    plan = await generate_workout_plan(current_user, db)
    return plan