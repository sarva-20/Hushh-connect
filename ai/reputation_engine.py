from typing import Dict


def _normalize(value: float, min_value: float = 0.0, max_value: float = 100.0) -> float:
    if value < min_value:
        return min_value
    if value > max_value:
        return max_value
    return value


def calculate_job_readiness(user: Dict) -> Dict:

    total_completed = int(user.get("total_gigs_completed", 0))
    rating = float(user.get("rating", 0.0))
    unique_skills = int(user.get("unique_skills_used", 0))
    gigs_last_30_days = int(user.get("gigs_last_30_days", 0))
    total_assigned = int(user.get("total_assigned_gigs", 0))

    #  Experience (Max 35)
    gig_score = min(total_completed * 7, 35)

    #  Rating Quality (Max 25)
    rating_score = (rating / 5.0) * 25

    #  Skill Depth (Max 20)
    skill_score = min(unique_skills * 4, 20)

    #  Consistency (Max 10)
    if gigs_last_30_days >= 3:
        consistency_score = 10
    elif gigs_last_30_days >= 1:
        consistency_score = 5
    else:
        consistency_score = 0

    #  Reliability (Max 10)
    if total_assigned > 0:
        completion_rate = total_completed / total_assigned
    else:
        completion_rate = 1.0  # New user assumed reliable

    reliability_score = completion_rate * 10

    # Final Score
    total_score = (
        gig_score
        + rating_score
        + skill_score
        + consistency_score
        + reliability_score
    )

    total_score = _normalize(total_score)

    return {
        "job_readiness_score": round(total_score, 2),
        "breakdown": {
            "gig_score": round(gig_score, 2),
            "rating_score": round(rating_score, 2),
            "skill_score": round(skill_score, 2),
            "consistency_score": round(consistency_score, 2),
            "reliability_score": round(reliability_score, 2),
        },
    }