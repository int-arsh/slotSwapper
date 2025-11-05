from datetime import datetime
import enum

from sqlalchemy import (
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship, Mapped

from .database import Base


class EventStatus(str, enum.Enum):
    BUSY = "BUSY"
    SWAPPABLE = "SWAPPABLE"
    SWAP_PENDING = "SWAP_PENDING"


class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    name: Mapped[str] = Column(String(100), nullable=False)
    email: Mapped[str] = Column(String(255), nullable=False, unique=True, index=True)
    password: Mapped[str] = Column(String(255), nullable=False)

    events = relationship(
        "Event",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    sent_requests = relationship(
        "SwapRequest",
        foreign_keys=lambda: [SwapRequest.requester_id],
        back_populates="requester",
        cascade="all, delete-orphan",
    )

    received_requests = relationship(
        "SwapRequest",
        foreign_keys=lambda: [SwapRequest.receiver_id],
        back_populates="receiver",
        cascade="all, delete-orphan",
    )


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    title: Mapped[str] = Column(String(200), nullable=False)
    start_time: Mapped[datetime] = Column(DateTime, nullable=False)
    end_time: Mapped[datetime] = Column(DateTime, nullable=False)
    status: Mapped[EventStatus] = Column(SAEnum(EventStatus), nullable=False, index=True)
    user_id: Mapped[int] = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    user = relationship("User", back_populates="events")

    outgoing_swaps = relationship(
        "SwapRequest",
        foreign_keys=lambda: [SwapRequest.my_slot_id],
        back_populates="my_slot",
    )
    incoming_swaps = relationship(
        "SwapRequest",
        foreign_keys=lambda: [SwapRequest.their_slot_id],
        back_populates="their_slot",
    )


class SwapRequest(Base):
    __tablename__ = "swap_requests"
    __table_args__ = (
        UniqueConstraint(
            "requester_id", "receiver_id", "my_slot_id", "their_slot_id",
            name="uq_swap_pair"
        ),
    )

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    requester_id: Mapped[int] = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    receiver_id: Mapped[int] = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    my_slot_id: Mapped[int] = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    their_slot_id: Mapped[int] = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    status: Mapped[RequestStatus] = Column(SAEnum(RequestStatus), nullable=False, index=True)

    requester = relationship("User", foreign_keys=[requester_id], back_populates="sent_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_requests")
    my_slot = relationship("Event", foreign_keys=[my_slot_id], back_populates="outgoing_swaps")
    their_slot = relationship("Event", foreign_keys=[their_slot_id], back_populates="incoming_swaps")


