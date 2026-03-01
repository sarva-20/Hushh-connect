from fastapi import APIRouter, Depends, HTTPException
from typing import List

from ai.vector_store import rebuild_vector_store
from ai.matching_engine import (
    suggest_gigs_for_user,
    detect_collaboration_for_gig,
)
from ai.leaderboard_engine import generate_leaderboard

# You will replace these with real DB calls
from services.db_service import (
    get_all_users,
    get_all_gigs,
    get_user_by_id,
    get_gig_by_id,
)

router = APIRouter(prefix="/ai", tags=["AI"])


# ---------------------------------------------------
# 1. Rebuild Vector Store
# ---------------------------------------------------

@router.post("/rebuild-vectors")
def rebuild_vectors():
    users = get_all_users()
    gigs = get_all_gigs()

    rebuild_vector_store(users, gigs)

    return {"status": "vector store rebuilt"}


# ---------------------------------------------------
# 2. Get Suggested Gigs (Feed)
# ---------------------------------------------------

@router.get("/suggestions/{user_id}")
def get_suggestions(user_id: str):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    gigs = get_all_gigs()

    suggestions = suggest_gigs_for_user(user, gigs, top_k=50)

    return {
        "user_id": user_id,
        "suggestions": suggestions,
    }


# ---------------------------------------------------
# 3. On-Demand Collaboration
# ---------------------------------------------------

@router.get("/collaboration/{gig_id}/{user_id}")
def get_collaboration(gig_id: str, user_id: str):
    user = get_user_by_id(user_id)
    gig = get_gig_by_id(gig_id)

    if not user or not gig:
        raise HTTPException(status_code=404, detail="User or Gig not found")

    collaboration = detect_collaboration_for_gig(gig, user)

    return {
        "gig_id": gig_id,
        "user_id": user_id,
        "collaboration": collaboration,
    }


# ---------------------------------------------------
# 4. Leaderboard
# ---------------------------------------------------

@router.get("/leaderboard")
def get_leaderboard(current_user_id: str):
    users = get_all_users()

    leaderboard = generate_leaderboard(users, current_user_id)

    return leaderboard