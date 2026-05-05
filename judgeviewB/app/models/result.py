def result_model(r) -> dict:
    return {
        "team_id": r.get("team_id"),
        "total_score": r.get("total_score"),
        "rank": r.get("rank")
    }