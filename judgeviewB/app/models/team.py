def team_model(team) -> dict:
    return {
        "id": str(team.get("_id")),
        "event_id": team.get("event_id"),
        "name": team.get("name")
    }