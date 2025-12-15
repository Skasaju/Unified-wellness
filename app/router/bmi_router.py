from fastapi import APIRouter, Depends, HTTPException
from core.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/api/bmi", tags=["User"])


@router.get("/")
def calculate_bmi(current_user: User = Depends(get_current_user)):
    """Calculate user BMI"""
    if not current_user.height_cm or not current_user.weight_kg:
        raise HTTPException(status_code=400, detail="Height and weight required")
    
    bmi = current_user.weight_kg / ((current_user.height_cm / 100) ** 2)
    
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"
    
    return {"bmi": round(bmi, 2), "category": category}