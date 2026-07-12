from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from firebase_admin import auth

from app.database.dependencies import get_db
from app.models.user import User


security = HTTPBearer(
    auto_error=False
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db)
):

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token"
        )


    token = credentials.credentials


    try:
        decoded_token = auth.verify_id_token(token)

    except Exception as e:
        print(e)

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )


    firebase_uid = decoded_token["uid"]
    email = decoded_token.get("email")


    user = (
        db.query(User)
        .filter(User.firebase_uid == firebase_uid)
        .first()
    )


    if not user:

        username = email.split("@")[0]

        user = User(
            firebase_uid=firebase_uid,
            email=email,
            username=username
        )

        db.add(user)
        db.commit()
        db.refresh(user)


    return user