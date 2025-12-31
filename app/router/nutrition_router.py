from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
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


@router.get("/search/{food_name}")
async def search_food(food_name: str):
    """
    Search for food nutrition information from USDA API.
    Returns nutrition data to auto-fill the form.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.nal.usda.gov/fdc/v1/foods/search",
                params={
                    "api_key": "DEMO_KEY",  # Replace with your own API key from https://fdc.nal.usda.gov/api-key-signup.html
                    "query": food_name,
                    "pageSize": 1
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("foods") and len(data["foods"]) > 0:
                    food = data["foods"][0]
                    nutrients = food.get("foodNutrients", [])
                    
                    # Extract nutrients by name or ID
                    energy = next((n for n in nutrients if n.get("nutrientName") == "Energy" or n.get("nutrientId") == 1008), {})
                    protein = next((n for n in nutrients if n.get("nutrientName") == "Protein" or n.get("nutrientId") == 1003), {})
                    carbs = next((n for n in nutrients if "Carbohydrate" in n.get("nutrientName", "") or n.get("nutrientId") == 1005), {})
                    fats = next((n for n in nutrients if "lipid" in n.get("nutrientName", "") or n.get("nutrientId") == 1004), {})
                    
                    return {
                        "success": True,
                        "food_name": food.get("description", food_name),
                        "calories": round(energy.get("value", 0)),
                        "protein": round(protein.get("value", 0), 1),
                        "carbs": round(carbs.get("value", 0), 1),
                        "fats": round(fats.get("value", 0), 1)
                    }
                
                return {"success": False, "message": "Food not found"}
            else:
                raise HTTPException(status_code=response.status_code, detail="Error fetching food data")
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timeout - USDA API is slow")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


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


@router.get("/stats")
def get_nutrition_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get nutrition statistics for current user.
    """
    nutrition_records = db.query(Nutrition)\
        .filter(Nutrition.user_id == current_user.id)\
        .all()
    
    total_calories = sum(n.calories for n in nutrition_records)
    total_protein = sum(n.protein for n in nutrition_records)
    total_carbs = sum(n.carbs for n in nutrition_records)
    total_fats = sum(n.fats for n in nutrition_records)
    
    return {
        "total_calories": round(total_calories, 1),
        "total_protein": round(total_protein, 1),
        "total_carbs": round(total_carbs, 1),
        "total_fats": round(total_fats, 1),
        "meals_logged": len(nutrition_records)
    }