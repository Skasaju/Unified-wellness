from fastapi import FastAPI,WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles

from typing import List
from datetime import datetime
import asyncio

from core.config import settings
from core.database import init_db

# Import routers
from router import page_router,auth_router,user_router,ai_router,products_router,blogs_router,health_router,nutrition_router,sleep_router,workout_router,bmi_router
from utils.create_admin import create_admin_user

from services.heart_rate_service import HeartRateSimulator
from models.health import HeartRate
from core.database import Session

# Active WebSocket connections
active_connections: List[WebSocket] = []

def include_router(app):
    # Include routers
    app.include_router(auth_router.router)
    app.include_router(user_router.router)
    app.include_router(page_router.router)
    app.include_router(ai_router.router)
    app.include_router(products_router.router)
    app.include_router(blogs_router.router)
    app.include_router(health_router.router)
    app.include_router(workout_router.router)
    app.include_router(sleep_router.router)
    app.include_router(nutrition_router.router)
    app.include_router(bmi_router.router)

def start_application():    
    app = FastAPI(title=settings.APP_NAME,version=settings.PROJECT_VERSION)
    # Mount static files
    app.mount("/static", StaticFiles(directory="static"), name="static")
  
    init_db()
    create_admin_user()
    include_router(app)
    return app

app = start_application()

@app.websocket("/ws/heart-rate/{user_id}")
async def websocket_heart_rate(websocket: WebSocket, user_id: int):
    await websocket.accept()
    active_connections.append(websocket)
    
    simulator = HeartRateSimulator(activity_level="resting")
    db = Session()
    try:
        activities = ["resting", "walking", "jogging", "running", "cooldown", "resting"]
        activity_index = 0
        messages_sent = 0
        
        while True:
            if messages_sent > 0 and messages_sent % 30 == 0:
                activity_index = min(activity_index + 1, len(activities) - 1)
                simulator.transition_activity(activities[activity_index])
            
            bpm = simulator.get_next_value()
            timestamp = datetime.now().isoformat()
            timestampdb = datetime.now()
            
            hr = HeartRate(
                user_id=user_id,
                bpm=bpm,
                timestamp=timestampdb
            )
            db.add(hr)
            db.commit()
            
            await websocket.send_json({
                "bpm": bpm,
                "timestamp": timestamp,
                "activity": simulator.activity_level,
                "user_id": user_id
            })
            
            messages_sent += 1
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        active_connections.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=5000)