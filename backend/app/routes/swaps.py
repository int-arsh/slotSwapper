from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Event, EventStatus, RequestStatus, SwapRequest
from ..auth import get_current_user
from .. import schemas


router = APIRouter(prefix="", tags=["swaps"])


@router.get("/swappable-slots", response_model=list[schemas.EventResponse])
def list_swappable_slots(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    events = (
        db.query(Event)
        .filter(Event.status == EventStatus.SWAPPABLE, Event.user_id != current_user.id)
        .order_by(Event.start_time.asc())
        .all()
    )
    return events


@router.post("/swap-request", response_model=schemas.SwapRequestOut, status_code=status.HTTP_201_CREATED)
def create_swap_request(payload: schemas.SwapRequestCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    my_event = db.query(Event).filter(Event.id == payload.my_slot_id, Event.user_id == current_user.id).first()
    their_event = db.query(Event).filter(Event.id == payload.their_slot_id).first()

    if not my_event or not their_event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if my_event.user_id == their_event.user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot swap with yourself")
    if my_event.status != EventStatus.SWAPPABLE or their_event.status != EventStatus.SWAPPABLE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Both slots must be SWAPPABLE")

    # Create the swap request and mark both events as pending
    swap_req = SwapRequest(
        requester_id=current_user.id,
        receiver_id=their_event.user_id,
        my_slot_id=my_event.id,
        their_slot_id=their_event.id,
        status=RequestStatus.PENDING,
    )
    my_event.status = EventStatus.SWAP_PENDING
    their_event.status = EventStatus.SWAP_PENDING

    db.add(swap_req)
    db.commit()
    db.refresh(swap_req)
    return swap_req


@router.get("/swap-requests/incoming", response_model=list[schemas.SwapRequestOut])
def get_incoming_requests(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get all swap requests where current user is the receiver"""
    requests = (
        db.query(SwapRequest)
        .filter(SwapRequest.receiver_id == current_user.id)
        .order_by(SwapRequest.id.desc())
        .all()
    )
    return requests


@router.get("/swap-requests/outgoing", response_model=list[schemas.SwapRequestOut])
def get_outgoing_requests(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get all swap requests where current user is the requester"""
    requests = (
        db.query(SwapRequest)
        .filter(SwapRequest.requester_id == current_user.id)
        .order_by(SwapRequest.id.desc())
        .all()
    )
    return requests


@router.post("/swap-response/{request_id}", response_model=schemas.SwapRequestOut)
def respond_to_swap(request_id: int, payload: schemas.SwapResponse, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    req = (
        db.query(SwapRequest)
        .filter(SwapRequest.id == request_id)
        .first()
    )
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Swap request not found")

    if req.receiver_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to respond to this request")

    my_event = db.query(Event).filter(Event.id == req.my_slot_id).with_for_update().first()
    their_event = db.query(Event).filter(Event.id == req.their_slot_id).with_for_update().first()

    if not my_event or not their_event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Related events not found")

    # Ensure both are in pending state before responding
    if my_event.status != EventStatus.SWAP_PENDING or their_event.status != EventStatus.SWAP_PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Swap no longer pending")

    # Atomic update
    try:
        with db.begin():
            if not payload.accept:
                req.status = RequestStatus.REJECTED
                my_event.status = EventStatus.SWAPPABLE
                their_event.status = EventStatus.SWAPPABLE
            else:
                # Accept: swap owners and mark BUSY
                req.status = RequestStatus.ACCEPTED
                original_owner = my_event.user_id
                my_event.user_id = their_event.user_id
                their_event.user_id = original_owner
                my_event.status = EventStatus.BUSY
                their_event.status = EventStatus.BUSY
        db.refresh(req)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to process swap")

    return req


