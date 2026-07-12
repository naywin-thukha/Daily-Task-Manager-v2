from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from app.database.dependencies import get_db

import app.models
import app.core.firebase

from app.core.auth import get_current_user
from app.models.user import User
from app.routers import tasks
from app.routers import dashboard
from app.core.exception import (
    TaskNotFoundException,
    task_not_found_handler
)

app = FastAPI(
    title="Daily Task Manager",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[

        "http://localhost:5173",

        "https://daily-task-manager-v2-mrek.vercel.app",

        "https://daily-task-manager-v2-mrek-naywin-thukhas-projects.vercel.app",

    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(dashboard.router)

app.add_exception_handler(
    TaskNotFoundException,
    task_not_found_handler
)


@app.get("/")
def root():
    return {
        "message": "Welcome to the Daily Task Manager API!"
    }


@app.get("/test-db")
def test_database(
    db: Session = Depends(get_db)
):
    return {
        "message": "Database session works"
    }


@app.get("/profile")
async def profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "firebase_uid": current_user.firebase_uid,
        "email": current_user.email,
        "username": current_user.username
    }