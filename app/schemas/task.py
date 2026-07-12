from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=255
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )

    completed: bool = False


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    completed: bool
    user_id: int

    model_config = ConfigDict(
        from_attributes=True
    )


class TaskUpdate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=255
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )

    completed: bool