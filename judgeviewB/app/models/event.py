def event_model(event) -> dict:
    return {
        "id": str(event.get("_id")),
        "name": event.get("name")
    }