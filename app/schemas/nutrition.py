from pydantic import BaseModel
from datetime import datetime


class NutritionCreate(BaseModel):
    food_name: str
    calories: float
    protein: float
    carbs: float
    fats: float


class NutritionResponse(BaseModel):
    id: int
    user_id: int
    food_name: str
    calories: float
    protein: float
    carbs: float
    fats: float
    date: datetime
    
    class Config:
        from_attributes = True