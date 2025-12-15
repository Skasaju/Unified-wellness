from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import asyncio

from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from models.health import HeartRate, Anomaly
from schemas.health import HeartRateCreate, HeartRateResponse
from services.heart_rate_service import HeartRateSimulator
from utils.anamoly_detection import detect_anomalies

router = APIRouter(prefix="/api/heart-rate", tags=["Health"])

@router.get("/history", response_model=List[HeartRateResponse])
def get_heart_rate_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get heart rate history for current user.
    """
    records = db.query(HeartRate)\
        .filter(HeartRate.user_id == current_user.id)\
        .order_by(HeartRate.timestamp.desc())\
        .limit(100)\
        .all()
    
    return records


@router.post("", response_model=HeartRateResponse)
def save_heart_rate(
    data: HeartRateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a heart rate reading.
    """
    hr = HeartRate(
        user_id=current_user.id,
        bpm=data.bpm,
        timestamp=datetime.now()
    )
    
    db.add(hr)
    db.commit()
    db.refresh(hr)
    
    return hr


@router.get("/simulate/{duration_seconds}")
def generate_heart_rate_history(duration_seconds: int = 3600):
    """
    Generate simulated heart rate history for testing.
    """
    simulator = HeartRateSimulator()
    history = []
    
    phases = [
        ("resting", 600),
        ("walking", 900),
        ("jogging", 1200),
        ("cooldown", 600),
        ("resting", 300)
    ]
    
    current_time = datetime.now()
    
    for activity, duration in phases:
        simulator.transition_activity(activity)
        for _ in range(duration):
            bpm = simulator.get_next_value()
            history.append({
                "timestamp": current_time.isoformat(),
                "bpm": bpm,
                "activity": activity
            })
            current_time = current_time + timedelta(seconds=1)
    
    return {
        "total_readings": len(history),
        "duration_seconds": sum(p[1] for p in phases),
        "data": history
    }


@router.get("/anomalies")
def get_heart_rate_anomalies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect and return heart rate anomalies for current user.
    """
    # Get recent heart rate records
    records = db.query(HeartRate)\
        .filter(HeartRate.user_id == current_user.id)\
        .order_by(HeartRate.timestamp.desc())\
        .limit(5000)\
        .all()
    
    # If not enough data, generate sample data
    if len(records) < 10:
        history_response = generate_heart_rate_history(1800)
        history = history_response["data"]
    else:
        history = [{"bpm": r.bpm, "timestamp": r.timestamp.isoformat()} for r in records]
    
    # Detect anomalies
    anomalies = detect_anomalies(history)
    
    # Save anomalies to database
    for anomaly in anomalies:
        existing = db.query(Anomaly)\
            .filter(Anomaly.user_id == current_user.id)\
            .filter(Anomaly.type == "heart_rate")\
            .first()
        
        if not existing:
            anom = Anomaly(
                user_id=current_user.id,
                type="heart_rate",
                message=f"Anomalous heart rate detected: {anomaly.get('bpm')} BPM (z-score: {anomaly.get('z_score')})",
                severity=anomaly.get('severity', 'medium'),
                timestamp=datetime.now()
            )
            db.add(anom)
    
    db.commit()
    
    return {
        "total_readings": len(history),
        "anomalies_detected": len(anomalies),
        "anomalies": anomalies
    }