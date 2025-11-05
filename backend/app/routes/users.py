from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..auth import SECRET_KEY, authenticate_user, create_user_token
from ..crud import create_user as crud_create_user
from ..crud import get_user_by_email
from ..database import get_db
from ..utils import hash_password


router = APIRouter(tags=["users"])


@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = crud_create_user(db, payload.name, payload.email, hash_password(payload.password))
    return user


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_user_token(user.id, SECRET_KEY, expires_minutes=30)
    return schemas.TokenResponse(access_token=token, expires_in=30 * 60)


