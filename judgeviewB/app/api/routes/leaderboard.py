from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.services.leaderboard_service import calculate_leaderboard

router = APIRouter()

@router.get("/{event_id}")
def get_leaderboard(event_id: str, user=Depends(get_current_user)):
    return calculate_leaderboard(event_id)