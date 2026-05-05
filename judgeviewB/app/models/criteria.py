def criteria_model(c) -> dict:
    return {
        "id": str(c.get("_id")),
        "event_id": c.get("event_id"),
        "name": c.get("name"),
        "max_score": c.get("max_score"),
        "weight": c.get("weight"),
        "priority": c.get("priority")
    }