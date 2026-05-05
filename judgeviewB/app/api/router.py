from fastapi import APIRouter
from app.api.routes import auth, events, criteria, scores, leaderboard, teams

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(criteria.router, prefix="/criteria", tags=["Criteria"])
api_router.include_router(scores.router, prefix="/scores", tags=["Scores"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])