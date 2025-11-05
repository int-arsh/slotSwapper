from datetime import datetime, timedelta
from typing import Optional

from pydantic import BaseModel, EmailStr

from .models import EventStatus, RequestStatus


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class EventBase(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    status: EventStatus


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[EventStatus] = None


class EventResponse(EventBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class SwapRequestCreate(BaseModel):
    my_slot_id: int
    their_slot_id: int


class SwapResponse(BaseModel):
    accept: bool


class SwapRequestOut(BaseModel):
    id: int
    requester_id: int
    receiver_id: int
    my_slot_id: int
    their_slot_id: int
    status: RequestStatus

    class Config:
        from_attributes = True


