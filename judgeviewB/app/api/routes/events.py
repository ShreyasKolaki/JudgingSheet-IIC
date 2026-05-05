from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.services.event_service import get_all_events, create_event, update_event, delete_event
from app.schemas.event import EventCreate

router = APIRouter()


@router.get("/")
def get_events(user=Depends(get_current_user)):
    return get_all_events()


@router.post("/")
def create_event_route(data: EventCreate, user=Depends(get_current_user)):
    return create_event(data.name)


@router.put("/{event_id}")
def update_event_route(event_id: str, data: EventCreate, user=Depends(get_current_user)):
    return update_event(event_id, data.name)


@router.delete("/{event_id}")
def delete_event_route(event_id: str, user=Depends(get_current_user)):
    return delete_event(event_id)