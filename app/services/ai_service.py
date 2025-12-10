import base64
import json
from typing import List
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from core.config import settings
from models.user import User
from models.health import Workout, Sleep
from schemas.ai import NutritionData,WorkoutPlan

from google import genai
from google.genai import types


# Initialize the Gemini Client
try:
    gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    # Handle case where API key is not configured or client fails to initialize
    print(f"Error initializing Gemini client: {e}")
    gemini_client = None


async def analyze_food_image(file: UploadFile):
    """Analyze food image using the Gemini Vision model (gemini-2.5-flash)"""
    
    # Check for client availability
    if not settings.GEMINI_API_KEY or not gemini_client:
        raise HTTPException(status_code=400, detail="Gemini API key not configured or client failed to initialize")
    
    # Read file content
    contents = await file.read()
    
    # Create the image Part for the multimodal prompt
    # Since we have the raw bytes and MIME type, Part.from_bytes is the appropriate method.
    image_part = types.Part.from_bytes(
        data=contents,
        mime_type=file.content_type  # e.g., "image/jpeg"
    )

    text_prompt = (
        "Analyze this food image and provide a comprehensive nutritional breakdown in JSON format. "
        "The analysis must include precise estimates for the main item, portion size, calories, and a full breakdown of "
        "macronutrients (including fiber, sugar, saturated, and unsaturated fats), and at least 5 key "
        "micronutrients (vitamins and minerals). Use the provided schema. "
        "Be precise in your estimates and use the universal values. Also include a short, personalized health tip."
    )
    
    try:
        response = await gemini_client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=[text_prompt, image_part],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=NutritionData, 
                temperature=0.1 
            )
        )
        
        nutrition_data = NutritionData.model_validate_json(response.text).model_dump()
        
        return nutrition_data
    
    except Exception as e:
        print(f"Gemini API or JSON parsing error: {e}")
        return {
            "food_name": "Unknown (Gemini API error)",
            "calories": 0,
            "protein": 0.0,
            "carbs": 0.0,
            "fats": 0.0,
            "portion_size": "Unknown"
        }


async def generate_workout_plan(user: User, db: Session):
    """Generate personalized workout plan using the Gemini API"""

    # Fallback plan if API is not configured
    if not settings.GEMINI_API_KEY or not gemini_client:
        return {
            "daily": "30 min cardio + strength training",
            "weekly": "5 days workout, 2 days rest",
            "monthly": "Progressive overload program",
            "tips": ["Stay hydrated", "Get enough sleep", "Track your progress"]
        }

    # Calculate BMI (assuming user.height_cm and user.weight_kg are available)
    bmi = user.weight_kg / ((user.height_cm / 100) ** 2) if user.height_cm else 0
    
    # Retrieve recent health data from DB
    workouts = db.query(Workout).filter(Workout.user_id == user.id).limit(5).all()
    sleep_records = db.query(Sleep).filter(Sleep.user_id == user.id).limit(5).all()
    
    avg_sleep = sum([s.hours for s in sleep_records]) / len(sleep_records) if sleep_records else 7
    
    # Construct a detailed prompt
    prompt = f"""
    Based on the following user data, generate a complete, 7-day personalized workout plan.
    - Age: {user.age}
    - Height: {user.height_cm}cm, Weight: {user.weight_kg}kg
    - BMI: {bmi:.1f}
    - Goals: {user.goals or 'general fitness'}
    - Average sleep: {avg_sleep:.1f} hours
    - Recent workouts: {len(workouts)} logged

    **The plan must be structured into a 4-week progression model.**

    **Daily Plan Requirements:** For each of the 7 days (or 5 training days + 2 rest/active rest days),
    provide the primary focus (e.g., 'Push Day', 'Legs', 'HIIT'), a warm-up list, a detailed list of
    main exercises with **specific sets and reps/duration**, a cardio component, and a cool-down list.

    **Weekly Overview:** Summarize the training split, total training volume, and rest days.
    
    **Monthly Progression:** Detail how the user should apply Progressive Overload over 4 weeks (e.g., increase weight, increase reps, decrease rest time).

    Provide the entire plan in JSON format strictly following the provided WorkoutPlan schema.
    """
            
    try:
        response = await gemini_client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt, # The detailed prompt
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=WorkoutPlan, 
                temperature=1
            )
        )
        
        # The SDK ensures the response.text is valid JSON matching the schema
        plan = WorkoutPlan.model_validate_json(response.text).model_dump()
        
        return plan
    
    except Exception as e:
        print(f"Gemini API or JSON parsing error: {e}")
        # Fallback plan on failure
        return {
            "daily": "30 min cardio + strength training (API error fallback)",
            "weekly": "5 days workout, 2 days rest",
            "monthly": "Progressive overload program",
            "tips": ["Stay hydrated", "Get enough sleep", "Track your progress"]
        }