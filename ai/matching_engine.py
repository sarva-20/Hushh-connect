from __future__ import annotations

from typing import Dict, List, Optional

from .vector_store import (
    cosine_sim,
    get_gig_description_vector,
    get_gig_skill_vector,
    get_user_description_vector,
    get_user_skill_vector,
    is_vector_store_ready,
)


def _to_float(value: object, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _to_int(value: object, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _normalize_score(value: float, min_value: float = 0.0, max_value: float = 1.0) -> float:
    if value < min_value:
        return min_value
    if value > max_value:
        return max_value
    return value


def _resolve_gig_owner_id(gig: Dict[str, object]) -> Optional[str]:
    for key in ("owner_id", "user_id", "created_by"):
        owner_id = gig.get(key)
        if owner_id is not None:
            owner_text = str(owner_id).strip()
            if owner_text:
                return owner_text
    return None


def calculate_match_score(
    gig: dict,
    user: dict,
    gig_desc_vec,
    gig_skill_vec,
) -> dict:

    user_id = str(user.get("id", "")).strip()

    description_similarity = cosine_sim(
        gig_desc_vec,
        get_user_description_vector(user_id),
    )

    skill_similarity = cosine_sim(
        gig_skill_vec,
        get_user_skill_vector(user_id),
    )

    # Optional relevance filter
    if skill_similarity < 0.05:
        return {"score": 0.0, "breakdown": {}}

    rating = _to_float(user.get("rating"), 0.0)
    readiness = _to_float(user.get("job_readiness_score"), 0.0)
    recent_gigs = _to_int(user.get("recent_gigs_30d"), 0)
    deadline_hours = _to_int(gig.get("deadline_hours"), 0)

    rating_normalized = _normalize_score(rating / 5.0)
    readiness_normalized = _normalize_score(readiness / 100.0)
    activity_score = _normalize_score(recent_gigs / 5.0)

    match_score = (
        0.35 * skill_similarity
        + 0.30 * description_similarity
        + 0.20 * rating_normalized
        + 0.10 * readiness_normalized
        + 0.05 * activity_score
    )

    if deadline_hours < 48:
        match_score += rating_normalized * 0.05

    match_score = _normalize_score(match_score)

    return {
        "score": float(match_score),
        "breakdown": {
            "skill_similarity": float(skill_similarity),
            "description_similarity": float(description_similarity),
            "rating": float(rating_normalized),
            "job_readiness": float(readiness_normalized),
            "activity": float(activity_score),
        },
    }


def rank_providers(gig: dict, users: List[dict]) -> List[dict]:

    if not is_vector_store_ready():
        return []

    gig_id = str(gig.get("id", "")).strip()
    owner_id = _resolve_gig_owner_id(gig)

    gig_desc_vec = get_gig_description_vector(gig_id)
    gig_skill_vec = get_gig_skill_vector(gig_id)

    ranked: List[dict] = []

    for user in users:
        user_id = str(user.get("id", "")).strip()
        if not user_id:
            continue

        if owner_id is not None and user_id == owner_id:
            continue

        score_data = calculate_match_score(
            gig,
            user,
            gig_desc_vec,
            gig_skill_vec,
        )

        if score_data["score"] > 0:
            ranked.append(
                {
                    "user_id": user_id,
                    "score": score_data["score"],
                    "breakdown": score_data["breakdown"],
                }
            )

    ranked.sort(key=lambda item: item["score"], reverse=True)
    return ranked[:3]