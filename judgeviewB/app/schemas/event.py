from pydantic import BaseModel


class EventCreate(BaseModel):
    name: str


class EventResponse(BaseModel):
    id: str
    name: str