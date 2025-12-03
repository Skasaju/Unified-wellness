from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserSignup(UserBase):
    password: str
    age: Optional[int] = 25
    height_cm: Optional[float] = 170.0
    weight_kg: Optional[float] = 70.0
    gender: Optional[str] = None
    goals: Optional[str] = None
    diet_type: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    gender: Optional[str] = None
    goals: Optional[str] = None
    diet_type: Optional[str] = None


class UserResponse(UserBase):
    id: int
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    gender: Optional[str] = None
    goals: Optional[str] = None
    diet_type: Optional[str] = None
    role: str
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse