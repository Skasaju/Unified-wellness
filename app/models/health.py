from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey
from datetime import datetime
from core.database import Base


class HeartRate(Base):
    __tablename__ = "heartrate"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    bpm = Column(Integer, nullable=False)


class Workout(Base):
    __tablename__ = "workout"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    type = Column(String, nullable=False)
    duration_min = Column(Integer, nullable=False)
    calories_burned = Column(Float, nullable=False)
    date = Column(Date, nullable=False)


class Sleep(Base):
    __tablename__ = "sleep"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    hours = Column(Float, nullable=False)
    quality = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)


class Nutrition(Base):
    __tablename__ = "nutrition"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    food_name = Column(String, nullable=False)
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    fats = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)


class Anomaly(Base):
    __tablename__ = "anomaly"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, default="medium")
    timestamp = Column(DateTime, default=datetime.utcnow)