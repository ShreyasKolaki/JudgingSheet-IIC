from pydantic import BaseModel


class LeaderboardItem(BaseModel):
    rank: int
    team_id: str
    team_name: str
    total: float