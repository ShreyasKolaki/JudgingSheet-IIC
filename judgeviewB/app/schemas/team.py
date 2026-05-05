from pydantic import BaseModel


class TeamResponse(BaseModel):
    id: str
    event_id: str
    name: str