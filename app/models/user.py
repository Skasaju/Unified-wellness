from sqlalchemy import Column, Integer, String, Float
from core.database import Base

class User(Base):
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String)
    age = Column(Integer)
    height_cm = Column(Float)
    weight_kg = Column(Float)
    gender = Column(String)
    goals = Column(String)
    diet_type = Column(String)
    role = Column(String, default="USER")