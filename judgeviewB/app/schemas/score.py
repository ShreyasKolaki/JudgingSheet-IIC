from pydantic import BaseModel, Field


class ScoreItem(BaseModel):
    team_id: str
    event_id: str
    criterion_id: str
    score: float = Field(ge=0, le=10)


class ScoreSubmitRequest(BaseModel):
    scores: list[ScoreItem]