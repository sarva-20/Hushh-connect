from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any

from ai.llm_service import enhance_gig_post, suggest_price
from services.db_service import (
    get_user_by_id,
    save_gig_to_db,
    get_all_gigs,
)
from services.vector_rebuild_service import rebuild_vectors_for_college

router = APIRouter(prefix="/gigs", tags=["Gigs"])


@router.post("/")
def create_gig(
    gig_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
):
    """
    Expected gig_data:
    {
        "title": str,
        "description": str,
        "skills": list[str],
        "deadline_hours": int,
        "posted_by": str
    }
    """

    title = gig_data.get("title")
    raw_description = gig_data.get("description")
    skills = gig_data.get("skills", [])
    deadline_hours = gig_data.get("deadline_hours")
    posted_by = gig_data.get("posted_by")

    if not title or not raw_description or not posted_by:
        raise HTTPException(status_code=400, detail="Missing required fields")

    user = get_user_by_id(posted_by)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Enhance description using LLM
    enhanced_result = enhance_gig_post(
        title=title,
        raw_description=raw_description,
        skills=skills,
    )

    enhanced_description = enhanced_result.get("enhanced_description")

    # Suggest pricing tiers
    pricing_result = suggest_price(
        title=title,
        description=enhanced_description,
        skills=skills,
    )

    new_gig = {
        "title": title,
        "description": enhanced_description,
        "skill_tags": skills,
        "deadline_hours": deadline_hours,
        "hours_since_posted": 0,
        "posted_by": posted_by,
        "college_id": user["college_id"],
        "pricing_options": pricing_result.get("pricing_options", []),
    }

    saved_gig = save_gig_to_db(new_gig)

    # Background rebuild only for that college
    background_tasks.add_task(
        rebuild_vectors_for_college,
        user["college_id"],
    )

    return {
        "status": "gig created",
        "gig": saved_gig,
        "pricing_options": pricing_result.get("pricing_options", []),
    }


@router.get("/")
def list_gigs():
    gigs = get_all_gigs()
    return {"gigs": gigs}