from pydantic import BaseModel
from typing import Optional
from datetime import date


class WorkoutCreate(BaseModel):
    type: str
    duration_min: int
    calories_burned: float
    date: Optional[date] = None


class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    type: str
    duration_min: int
    calories_burned: float
    date: date
    
    class Config:
        from_attributes = True