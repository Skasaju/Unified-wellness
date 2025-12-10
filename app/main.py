from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from core.config import settings
from core.database import init_db, engine, get_db
from core.security import hash_password
from models.user import User

# Import routers
from router import page_router,auth_router,user_router,ai_router,products_router

def create_admin_user():
    """Create default admin user if not exists"""
    db = next(get_db())
    try:
        admin = db.query(User).filter(User.email == "admin@health.com").first()
        if not admin:
            admin = User(
                name="Admin User",
                email="admin@health.com",
                password_hash=hash_password("admin"),
                role="ADMIN",
                age=30,
                height_cm=175.0,
                weight_kg=70.0
            )
            db.add(admin)
            db.commit()
            print("✓ Admin user created: admin@health.com / admin")
    except Exception as e:
        print(f"Note: Could not create admin user: {e}")
        db.rollback()
    finally:
        db.close()


def include_router(app):
    # Include routers
    app.include_router(auth_router.router)
    app.include_router(user_router.router)
    app.include_router(page_router.router)
    app.include_router(ai_router.router)
    app.include_router(products_router.router)

def start_application():    
    app = FastAPI(title=settings.APP_NAME,version=settings.PROJECT_VERSION)
    # Mount static files
    app.mount("/static", StaticFiles(directory="static"), name="static")
    init_db()
    create_admin_user()
    include_router(app)
    return app


app = start_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=5000)