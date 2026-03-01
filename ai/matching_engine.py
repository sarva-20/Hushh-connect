from __future__ import annotations

from typing import Dict, List, Optional

from sklearn.metrics.pairwise import cosine_similarity

from .vector_store import (
    cosine_sim,
    get_user_description_vector,
    get_user_skill_vector,
    get_gig_description_vector,
    get_gig_skill_vector,
    get_gig_skill_matrix,
    get_gig_id_order,
    get_user_skill_matrix,
    get_user_id_order,
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
# FAST SUGGESTION ENGINE (User → Top 50 Gigs)
# -------------------------------------------------

def suggest_gigs_for_user(
    user: dict,
    gigs: List[dict],
    top_k: int = 50,
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

    gig_skill_matrix = get_gig_skill_matrix()
    gig_id_order = get_gig_id_order()

    if gig_skill_matrix is None or not gig_id_order:
        return []

    # Build fast gig lookup map (O(n) once)
    gig_map = {str(g.get("id")): g for g in gigs}

    # -----------------------------------------
    # 1. Matrix-level similarity (single call)
    # -----------------------------------------

    skill_similarities = cosine_similarity(
        user_skill_vec,
        gig_skill_matrix,
    )[0]

    # -----------------------------------------
    # 2. Get top_k indices
    # -----------------------------------------

    sorted_indices = skill_similarities.argsort()[::-1]
    top_indices = sorted_indices[:top_k]

    suggestions: List[dict] = []

    # -----------------------------------------
    # 3. Score only top_k gigs
    # -----------------------------------------

    for idx in top_indices:
        gig_id = gig_id_order[idx]
        gig = gig_map.get(gig_id)

        if not gig:
            continue

        gig_desc_vec = get_gig_description_vector(gig_id)

        skill_similarity = float(skill_similarities[idx])

        description_similarity = cosine_sim(
            gig_desc_vec,
            user_desc_vec,
        )

        deadline_hours = _to_int(gig.get("deadline_hours"), 0)
        hours_since_posted = _to_float(gig.get("hours_since_posted"), 0.0)

        urgency = 1.0 if deadline_hours < 48 else 0.0
        freshness = max(1.0 - (hours_since_posted / 72.0), 0.0)

        score = (
            0.45 * skill_similarity
            + 0.35 * description_similarity
            + 0.10 * urgency
            + 0.10 * freshness
        )

        score = _normalize_score(score)

        suggestions.append(
            {
                "gig_id": gig_id,
                "score": float(score),
                "skill_similarity": skill_similarity,
                "description_similarity": float(description_similarity),
                "urgency": urgency,
                "freshness": freshness,
            }
        )

    suggestions.sort(key=lambda item: item["score"], reverse=True)

    return suggestions


# -------------------------------------------------
# ON-DEMAND COLLABORATION ENGINE
# (Call only when user opens gig detail)
# -------------------------------------------------

def detect_collaboration_for_gig(
    gig: dict,
    user: dict,
    top_user_limit: int = 100,
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

    # If already strong match → no collaboration needed
    if base_similarity >= 0.35:
        return None

    user_skill_matrix = get_user_skill_matrix()
    user_id_order = get_user_id_order()

    if user_skill_matrix is None:
        return None

    # Single matrix similarity call
    similarities = cosine_similarity(
        gig_skill_vec,
        user_skill_matrix,
    )[0]

    # Top N candidate users
    sorted_indices = similarities.argsort()[::-1][:top_user_limit]

    collaboration_candidates = []

    for idx in sorted_indices:
        other_id = user_id_order[idx]

        if other_id == user_id:
            continue

        other_skill_vec = user_skill_matrix[idx]

        combined_vector = user_skill_vec + other_skill_vec
        combined_similarity = cosine_sim(
            gig_skill_vec,
            combined_vector,
        )

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