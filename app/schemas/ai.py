from pydantic import BaseModel, Field
from typing import List

# --- Nutrition Schema ---

class Macronutrients(BaseModel):
    """Detailed macronutrient breakdown."""
    protein_g: float = Field(..., description="Protein content in grams.")
    carbs_total_g: float = Field(..., description="Total carbohydrate content in grams.")
    fiber_g: float = Field(..., description="Dietary fiber content in grams.")
    sugars_g: float = Field(..., description="Total sugar content in grams.")
    fats_total_g: float = Field(..., description="Total fat content in grams.")
    fats_saturated_g: float = Field(..., description="Saturated fat content in grams.")
    fats_unsaturated_g: float = Field(..., description="Includes Monounsaturated and Polyunsaturated fat content in grams.")

class Micronutrient(BaseModel):
    """A single micronutrient detail."""
    name: str = Field(..., description="Name of the micronutrient (e.g., 'Iron', 'Vitamin C').")
    amount_mg_mcg: str = Field(..., description="Amount with unit (e.g., '1.5 mg', '150 mcg').")
    daily_value_percent: int = Field(..., description="Percentage of the recommended daily value.")

class NutritionData(BaseModel):
    """Comprehensive nutritional analysis for a food item."""
    food_name: str = Field(..., description="Name of the main food or dish analyzed.")
    estimated_portion_size: str = Field(..., description="AI's estimate of the portion size (e.g., '1 cup', '150g').")
    calories_kcal: int = Field(..., description="Total estimated calories in kcal.")
    macros: Macronutrients
    micronutrients: List[Micronutrient]
    summary_and_tips: str = Field(..., description="A short health summary and personalized tip based on the food.")

# --- Workout Schema ---

class ExerciseDetail(BaseModel):
    """Detail for a single exercise."""
    name: str = Field(..., description="Name of the exercise (e.g., 'Barbell Squat', 'Push-ups').")
    muscle_group: str = Field(..., description="Primary muscle group targeted (e.g., 'Quads/Glutes', 'Chest/Triceps').")
    sets: int = Field(..., description="Number of sets.")
    reps: str = Field(..., description="Repetition range or duration (e.g., '8-12 reps', '45 seconds').")
    rest_seconds: int = Field(..., description="Rest time between sets in seconds.")

class DailyPlan(BaseModel):
    """Plan for a single workout day."""
    day: str = Field(..., description="Day of the week (e.g., 'Monday').")
    focus: str = Field(..., description="Focus of the day (e.g., 'Lower Body Strength', 'Active Recovery').")
    warm_up: List[str] = Field(..., description="List of warm-up activities.")
    exercises: List[ExerciseDetail]
    cardio: str = Field(..., description="Cardio details (e.g., '20 mins steady-state cycling').")
    cool_down: List[str] = Field(..., description="List of cool-down activities/stretches.")

class WorkoutPlan(BaseModel):
    """The complete personalized workout plan."""
    daily_plan: List[DailyPlan]
    weekly_overview: str = Field(..., description="Summary of the weekly split and training volume.")
    monthly_progression: str = Field(..., description="Detail on how to apply progressive overload over a 4-week period.")
    personalized_tips: List[str] = Field(..., description="Specific tips for form, recovery, and nutrition.")