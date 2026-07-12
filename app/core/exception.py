from fastapi import Request
from fastapi.responses import JSONResponse


class TaskNotFoundException(Exception):
    pass


async def task_not_found_handler(
    request: Request,
    exc: TaskNotFoundException
):
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": {
                "code": "TASK_NOT_FOUND",
                "message": "Task not found"
            }
        }
    )