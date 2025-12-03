from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime
from core.database import Base


class Blog(Base):
    __tablename__ = "blog"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)