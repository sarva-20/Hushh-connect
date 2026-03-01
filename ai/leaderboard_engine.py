from __future__ import annotations

from typing import Dict, List, Optional

from .reputation_engine import calculate_job_readiness


def _assign_badge(score: float) -> str:
    if score >= 85:
        return "Elite"
    elif score >= 70:
        return "Pro"
    elif score >= 50:
        return "Active"
    else:
        return "New"


def generate_leaderboard(
    users: List[Dict],
    current_user_id: Optional[str] = None,
) -> Dict:

    leaderboard_rows: List[Dict] = []

    for user in users:
        readiness_result = calculate_job_readiness(user)
        score = round(float(readiness_result.get("job_readiness_score", 0.0)), 2)

        leaderboard_rows.append(
            {
                "user_id": user.get("id", ""),
                "name": user.get("name", ""),
                "department": user.get("department", ""),
                "job_readiness_score": score,
                "total_gigs_completed": int(user.get("total_gigs_completed", 0)),
                "rating": round(float(user.get("rating", 0.0)), 2),
                "badge": _assign_badge(score),
            }
        )

    leaderboard_rows.sort(
        key=lambda row: (-row["job_readiness_score"], row["name"], row["user_id"])
    )

    ranked: List[Dict] = []

    current_rank = 0
    last_score = None

    for index, row in enumerate(leaderboard_rows):
        if row["job_readiness_score"] != last_score:
            current_rank = index + 1
            last_score = row["job_readiness_score"]

        ranked_row = {
            "rank": current_rank,
            **row,
        }

        ranked.append(ranked_row)

    top_10 = ranked[:10]

    current_user_rank = None
    if current_user_id:
        for row in ranked:
            if row["user_id"] == current_user_id:
                current_user_rank = row
                break

    return {
        "top_10": top_10,
        "current_user_rank": current_user_rank,
    }