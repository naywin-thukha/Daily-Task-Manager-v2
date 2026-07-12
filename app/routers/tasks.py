from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.task import Task
from app.models.user import User

from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

from app.core.auth import get_current_user


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# Create Task
@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_task = Task(
        title=task.title,
        description=task.description,
        completed=task.completed,
        user_id=current_user.id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


# Get Tasks + Filtering + Searching
@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    completed: bool | None = Query(
        default=None
    ),
    search: str | None = Query(
        default=None
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id
        )
    )

    # Filter completed status
    if completed is not None:
        query = query.filter(
            Task.completed == completed
        )

    # Search title
    if search:
        query = query.filter(
            Task.title.contains(search)
        )

    return query.all()



# Update Task
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    task.title = task_update.title
    task.description = task_update.description
    task.completed = task_update.completed


    db.commit()
    db.refresh(task)

    return task



# Delete Task
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    db.delete(task)
    db.commit()


    return {
        "message": "Task deleted successfully"
    }