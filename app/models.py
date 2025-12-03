from sqlmodel import SQLModel, Field
from typing import Optional
import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    username: str
    hashed_password: str
    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow
    )


class HeartRate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    bpm: int
    timestamp: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow
    )


class Workout(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    type: str
    duration_minutes: int
    calories: int
    timestamp: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow
    )
