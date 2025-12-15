from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class HeartRateCreate(BaseModel):
    bpm: int


class HeartRateResponse(BaseModel):
    id: int
    user_id: int
    bpm: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


class SleepCreate(BaseModel):
    hours: float
    quality: int
    date: Optional[date] = None


class SleepResponse(BaseModel):
    id: int
    user_id: int
    hours: float
    quality: int
    date: date
    
    class Config:
        from_attributes = True


class AnomalyResponse(BaseModel):
    id: int
    user_id: int
    type: str
    message: str
    severity: str
    timestamp: datetime
    
    class Config:
        from_attributes = True