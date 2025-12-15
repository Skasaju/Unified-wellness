from core.database import  get_db
from core.security import hash_password
from models.user import User

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
