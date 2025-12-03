from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import get_session
from app.models import User
from passlib.context import CryptContext

router = APIRouter(prefix="/users", tags=["Users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register")
def register_user(email: str, username: str, password: str,
                  session: Session = Depends(get_session)):
    
    # check if exists
    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(password)
    new_user = User(email=email, username=username, hashed_password=hashed_pw)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message": "User registered", "user_id": new_user.id}
