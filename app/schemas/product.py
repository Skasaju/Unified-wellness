from datetime import datetime
from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str 


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category: str
    image_url: str  
    created_at: datetime
    
    class Config:
        from_attributes = True