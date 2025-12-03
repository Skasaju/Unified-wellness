from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv
import os

load_dotenv()
class Settings:
    APP_NAME = "Unified Wellness FASTAPI Backend"
    PROJECT_VERSION = "0.5.0"
    DATABASE_URL = os.getenv("DATABASE_URL")

    SECRET_KEY = os.getenv("SECRET_KEY")
    SESSION_SECRET = os.getenv("SESSION_SECRET")
    ALGORITHM =  os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_DAYS = 7
    
    OPENAI_API_KEY = None

settings = Settings()