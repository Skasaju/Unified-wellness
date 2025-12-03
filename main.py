from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings
from app.db import create_db_and_tables
from app.api.users import router as users_router

app = FastAPI(title="Health & Fitness using uv")

app.add_middleware(SessionMiddleware, secret_key=settings.SESSION_SECRET)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.on_event("startup")
def startup():
    create_db_and_tables()

app.include_router(users_router)

@app.get("/")
def root():
    return {"message": "Backend working with uv! 🎉 Visit /static/index.html"}
