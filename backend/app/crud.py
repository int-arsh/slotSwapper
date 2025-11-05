from typing import List, Optional

from sqlalchemy.orm import Session

from .models import Event, EventStatus, SwapRequest, RequestStatus, User


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, name: str, email: str, hashed_password: str) -> User:
    user = User(name=name, email=email, password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_user_events(db: Session, user_id: int) -> List[Event]:
    return db.query(Event).filter(Event.user_id == user_id).order_by(Event.start_time.asc()).all()


def create_event(db: Session, user_id: int, title: str, start_time, end_time, status: EventStatus) -> Event:
    event = Event(title=title, start_time=start_time, end_time=end_time, status=status, user_id=user_id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_event(db: Session, event_id: int) -> Optional[Event]:
    return db.query(Event).filter(Event.id == event_id).first()


def delete_event(db: Session, event: Event) -> None:
    db.delete(event)
    db.commit()


def find_swappable_events_for_others(db: Session, user_id: int) -> List[Event]:
    return (
        db.query(Event)
        .filter(Event.status == EventStatus.SWAPPABLE, Event.user_id != user_id)
        .order_by(Event.start_time.asc())
        .all()
    )


def create_swap_request(
    db: Session,
    requester_id: int,
    receiver_id: int,
    my_slot_id: int,
    their_slot_id: int,
) -> SwapRequest:
    req = SwapRequest(
        requester_id=requester_id,
        receiver_id=receiver_id,
        my_slot_id=my_slot_id,
        their_slot_id=their_slot_id,
        status=RequestStatus.PENDING,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def get_swap_request(db: Session, request_id: int) -> Optional[SwapRequest]:
    return db.query(SwapRequest).filter(SwapRequest.id == request_id).first()


