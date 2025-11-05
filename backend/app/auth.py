import os
from datetime import timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .utils import create_access_token, decode_access_token, verify_password

# Load environment variables from .env file
load_dotenv()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user: Optional[User] = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


def create_user_token(user_id: int, secret_key: str, expires_minutes: int = 30) -> str:
    return create_access_token({"sub": str(user_id)}, secret_key, timedelta(minutes=expires_minutes))


# Get SECRET_KEY from environment variable, with fallback for development
# In production, always set SECRET_KEY in environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-change-me-dev-only")
if SECRET_KEY == "super-secret-change-me-dev-only":
    import warnings
    warnings.warn(
        "Using default SECRET_KEY. Set SECRET_KEY environment variable for production!",
        UserWarning
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = decode_access_token(token, SECRET_KEY)
        subject = payload.get("sub")
        if subject is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = int(subject)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


