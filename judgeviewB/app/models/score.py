def score_model(score) -> dict:
    return {
        "team_id": score.get("team_id"),
        "event_id": score.get("event_id"),
        "criterion_id": score.get("criterion_id"),
        "judge_id": score.get("judge_id"),
        "score": score.get("score")
    }