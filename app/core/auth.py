from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from firebase_admin import auth

from app.database.dependencies import get_db
from app.models.user import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        decoded_token = auth.verify_id_token(token)

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    firebase_uid = decoded_token["uid"]
    email = decoded_token.get("email")

    # Check if user already exists in MySQL
    user = (
        db.query(User)
        .filter(User.firebase_uid == firebase_uid)
        .first()
    )

    # If first login, create user automatically
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