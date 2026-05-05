from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.services.criteria_service import get_criteria, create_criteria, update_criteria, delete_criteria
from app.schemas.criteria import CriteriaCreate

router = APIRouter()


@router.get("/{event_id}")
def get_criteria_route(event_id: str, user=Depends(get_current_user)):
    return get_criteria(event_id)


@router.post("/")
def create_criteria_route(data: CriteriaCreate, user=Depends(get_current_user)):
    return create_criteria(data.model_dump())


@router.put("/{criteria_id}")
def update_criteria_route(criteria_id: str, data: CriteriaCreate, user=Depends(get_current_user)):
    return update_criteria(criteria_id, data.model_dump())


@router.delete("/{criteria_id}")
def delete_criteria_route(criteria_id: str, user=Depends(get_current_user)):
    return delete_criteria(criteria_id)