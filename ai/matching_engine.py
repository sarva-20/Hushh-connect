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


# -------------------------------------------------
# Utility Helpers
# -------------------------------------------------

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


def _normalize_score(value: float) -> float:
    if value < 0.0:
        return 0.0
    if value > 1.0:
        return 1.0
    return value


# -------------------------------------------------
# SUGGESTION ENGINE (User → Gigs)
# -------------------------------------------------

def suggest_gigs_for_user(
    user: dict,
    gigs: List[dict],
    all_users: List[dict],
) -> List[dict]:

    if not is_vector_store_ready():
        return []

    user_id = str(user.get("id", "")).strip()
    if not user_id:
        return []

    user_desc_vec = get_user_description_vector(user_id)
    user_skill_vec = get_user_skill_vector(user_id)

    if user_desc_vec is None or user_skill_vec is None:
        return []

    suggestions: List[dict] = []

    for gig in gigs:
        gig_id = str(gig.get("id", "")).strip()
        if not gig_id:
            continue

        gig_desc_vec = get_gig_description_vector(gig_id)
        gig_skill_vec = get_gig_skill_vector(gig_id)

        if gig_desc_vec is None or gig_skill_vec is None:
            continue

        # --- Core Similarities ---
        skill_similarity = cosine_sim(gig_skill_vec, user_skill_vec)
        description_similarity = cosine_sim(gig_desc_vec, user_desc_vec)

        # --- Urgency & Freshness ---
        deadline_hours = _to_int(gig.get("deadline_hours"), 0)
        hours_since_posted = _to_float(gig.get("hours_since_posted"), 0.0)

        urgency = 1.0 if deadline_hours < 48 else 0.0
        freshness = max(1.0 - (hours_since_posted / 72.0), 0.0)

        # --- Suggestion Score ---
        score = (
            0.45 * skill_similarity
            + 0.35 * description_similarity
            + 0.10 * urgency
            + 0.10 * freshness
        )

        score = _normalize_score(score)

        # --- Inline Collaboration Suggestion ---
        collaboration = None
        if skill_similarity < 0.35:
            collaboration = detect_collaboration_for_gig(
                gig,
                user,
                all_users,
            )

        suggestions.append(
            {
                "gig_id": gig_id,
                "score": float(score),
                "skill_similarity": float(skill_similarity),
                "description_similarity": float(description_similarity),
                "urgency": float(urgency),
                "freshness": float(freshness),
                "collaboration": collaboration,
            }
        )

    suggestions.sort(key=lambda item: item["score"], reverse=True)
    return suggestions


# -------------------------------------------------
# COLLABORATION DETECTION (Top 2)
# -------------------------------------------------

def detect_collaboration_for_gig(
    gig: dict,
    user: dict,
    all_users: List[dict],
) -> Optional[List[dict]]:

    if not is_vector_store_ready():
        return None

    gig_id = str(gig.get("id", "")).strip()
    user_id = str(user.get("id", "")).strip()

    if not gig_id or not user_id:
        return None

    gig_skill_vec = get_gig_skill_vector(gig_id)
    user_skill_vec = get_user_skill_vector(user_id)

    if gig_skill_vec is None or user_skill_vec is None:
        return None

    base_similarity = cosine_sim(gig_skill_vec, user_skill_vec)

    # If user already sufficiently matched, no collaboration needed
    if base_similarity >= 0.35:
        return None

    collaboration_candidates = []

    for other in all_users:
        other_id = str(other.get("id", "")).strip()
        if not other_id or other_id == user_id:
            continue

        other_skill_vec = get_user_skill_vector(other_id)
        if other_skill_vec is None:
            continue

        # Sparse vector addition (efficient)
        combined_vector = user_skill_vec + other_skill_vec
        combined_similarity = cosine_sim(gig_skill_vec, combined_vector)

        if combined_similarity > 0.5:
            collaboration_candidates.append(
                {
                    "collaborate_with": other_id,
                    "combined_similarity": float(combined_similarity),
                }
            )

    if not collaboration_candidates:
        return None

    collaboration_candidates.sort(
        key=lambda x: x["combined_similarity"],
        reverse=True,
    )

    return collaboration_candidates[:2]