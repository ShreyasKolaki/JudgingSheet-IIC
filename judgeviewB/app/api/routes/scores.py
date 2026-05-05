from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.services.score_service import submit_scores, get_team_scores
from app.schemas.score import ScoreSubmitRequest

router = APIRouter()


@router.post("/")
def submit_scores_route(data: ScoreSubmitRequest, user=Depends(get_current_user)):
    scores_dict = [score.model_dump() for score in data.scores]
    return submit_scores(scores_dict, user["email"])


@router.get("/{event_id}/{team_id}")
def get_scores_for_team(event_id: str, team_id: str, user=Depends(get_current_user)):
    """Get aggregated (averaged across judges) scores for a team in an event."""
    return get_team_scores(event_id, team_id)