from pydantic import BaseModel


class CriteriaCreate(BaseModel):
    event_id: str
    name: str
    max_score: int = 10
    weight: float = 1
    priority: int


class CriteriaResponse(BaseModel):
    id: str
    event_id: str
    name: str
    max_score: int
    weight: float
    priority: int