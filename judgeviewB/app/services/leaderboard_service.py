from app.database.collections import (
    get_scores_collection,
    get_criteria_collection,
    get_teams_collection
)


def calculate_leaderboard(event_id: str):
    scores = list(get_scores_collection().find({"event_id": event_id}))
    criteria = list(get_criteria_collection().find({"event_id": event_id}))
    teams = list(get_teams_collection().find({"event_id": event_id}))

    weight_map = {str(c["_id"]): c.get("weight", 1) for c in criteria}
    priority_sorted = sorted(criteria, key=lambda x: x.get("priority", 999))

    team_crit_scores = {}

    for s in scores:
        team_id = s["team_id"]
        crit_id = str(s["criterion_id"])
        score = s["score"]

        if team_id not in team_crit_scores:
            team_crit_scores[team_id] = {}
        if crit_id not in team_crit_scores[team_id]:
            team_crit_scores[team_id][crit_id] = []
            
        team_crit_scores[team_id][crit_id].append(score)

    team_scores = {}
    for team_id, crits in team_crit_scores.items():
        total = 0
        crit_avgs = {}
        for crit_id, crit_scores_list in crits.items():
            avg = sum(crit_scores_list) / len(crit_scores_list)
            crit_avgs[crit_id] = avg
            weighted = avg * weight_map.get(crit_id, 1)
            total += weighted
            
        team_scores[team_id] = {
            "total": total,
            "criteria": crit_avgs
        }

    result = []

    for team in teams:
        team_id = str(team["_id"])   # ✅ FIXED
        team_name = team.get("name")

        data = team_scores.get(team_id, {"total": 0, "criteria": {}})

        result.append({
            "team_id": team_id,
            "team_name": team_name,
            "total": data["total"],
            "criteria": data["criteria"]
        })

    def sort_key(team):
        return (
            -team["total"],
            *[
                -team["criteria"].get(str(c["_id"]), 0)
                for c in priority_sorted
            ]
        )

    result.sort(key=sort_key)

    ranked = []
    rank = 1
    prev = None

    for i, team in enumerate(result):
        if prev and sort_key(team) != sort_key(prev):
            rank = i + 1

        ranked.append({
            "rank": rank,
            "team_id": team["team_id"],
            "team_name": team["team_name"],
            "total": team["total"]
        })

        prev = team

    return ranked