from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.database.collections import get_teams_collection
from app.utils.helpers import serialize_mongo_list

router = APIRouter()


@router.get("/{event_id}")
def get_teams(event_id: str, user=Depends(get_current_user)):
    teams = list(get_teams_collection().find({"event_id": event_id}))
    return serialize_mongo_list(teams)