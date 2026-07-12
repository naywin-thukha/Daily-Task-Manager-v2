from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.task import Task
from app.models.user import User
from app.core.auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    total_tasks = (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .count()
    )

    completed_tasks = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.completed == True
        )
        .count()
    )

    pending_tasks = total_tasks - completed_tasks

    completion_rate = 0

    if total_tasks > 0:
        completion_rate = (
            completed_tasks / total_tasks
        ) * 100


    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "completion_rate": completion_rate
    }