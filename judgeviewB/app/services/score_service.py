from fastapi import HTTPException
from app.database.collections import get_scores_collection, get_criteria_collection


def submit_scores(scores: list, judge_email: str):
    scores_col = get_scores_collection()

    for s in scores:
        if s["score"] < 0 or s["score"] > 10:
            raise HTTPException(status_code=400, detail="Score must be between 0 and 10")

        scores_col.update_one(
            {
                "team_id": s["team_id"],
                "event_id": s["event_id"],
                "criterion_id": s["criterion_id"],
                "judge_id": judge_email
            },
            {"$set": {"score": s["score"]}},
            upsert=True
        )

    return {"ok": True}


def get_team_scores(event_id: str, team_id: str):
    """Return per-criterion average scores for a team (averaged across all judges)."""
    scores_col = get_scores_collection()
    criteria_col = get_criteria_collection()

    scores = list(scores_col.find({"event_id": event_id, "team_id": team_id}))
    criteria = list(criteria_col.find({"event_id": event_id}))

    # Build a lookup: criterion_id -> criterion details
    crit_map = {str(c["_id"]): c for c in criteria}

    # Group scores by criterion
    crit_scores: dict = {}
    for s in scores:
        crit_id = str(s["criterion_id"])
        crit_scores.setdefault(crit_id, []).append(s["score"])

    # Compute averages and build result
    result = []
    total = 0.0
    for c in criteria:
        crit_id = str(c["_id"])
        raw_scores = crit_scores.get(crit_id, [])
        avg = sum(raw_scores) / len(raw_scores) if raw_scores else 0.0
        weight = c.get("weight", 1)
        total += avg * weight
        result.append({
            "criterion_id": crit_id,
            "criterion_name": c.get("name"),
            "score": round(avg, 2),
            "max_score": c.get("max_score", 10),
            "weight": weight,
        })

    return {"items": result, "total": round(total, 2)}