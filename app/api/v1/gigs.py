from fastapi import APIRouter, HTTPException, Depends
from app.models.gig import Gig
from app.models.user import User
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/", response_model=List[Gig])
async def get_gig_feed(user_year: int):
    """
    Fetch gigs with 'Alumni Protection' logic:
    - If user is Year 5 (Alumni), only show gigs older than 48 hours.
    - If user is Year 1-4, show all open gigs.
    """
    query = Gig.status == "open"
    
    if user_year >= 5:
        # Alumni logic: only see gigs posted > 48hrs ago
        cutoff_time = datetime.utcnow() - timedelta(hours=48)
        gigs = await Gig.find(query, Gig.created_at <= cutoff_time).sort("-created_at").to_list()
    else:
        # Students see everything fresh
        gigs = await Gig.find(query).sort("-created_at").to_list()
        
    return gigs

@router.post("/create")
async def create_gig(gig_data: Gig, user_id: str):
    """Post a new gig and link it to the current user"""
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    gig_data.posted_by = user
    await gig_data.insert()
    return {"status": "success", "gig_id": str(gig_data.id)}
@router.patch("/{gig_id}/apply")
async def apply_for_gig(gig_id: str, applicant_id: str):
    gig = await Gig.get(gig_id)
    applicant = await User.get(applicant_id)
    
    if not gig or not applicant:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    if gig.status != "open":
        raise HTTPException(status_code=400, detail="Gig is no longer available")

    # Update gig status
    gig.status = "in_progress"
    gig.assigned_to = applicant
    await gig.save()
    
    return {"status": "success", "message": f"Connected with {applicant.name}"}
@router.post("/{gig_id}/complete")
async def complete_gig(gig_id: str, rating: int, review: str, card_url: str):
    # 1. Fetch Gig and link the linked User objects
    gig = await Gig.get(gig_id, fetch_links=True)
    if not gig or gig.status != "in_progress":
        raise HTTPException(status_code=400, detail="Gig cannot be completed")

    provider = gig.assigned_to
    requester = gig.posted_by

    # 2. Create the Proof of Work record
    pow_entry = ProofOfWork(
        gig=gig,
        provider=provider,
        requester=requester,
        rating=rating,
        review=review,
        card_url=card_url
    )
    await pow_entry.insert()

    # 3. Update Provider Stats
    # Recalculate average rating
    total_rating_val = (provider.rating * provider.rating_count) + rating
    provider.rating_count += 1
    provider.rating = total_rating_val / provider.rating_count
    
    provider.total_gigs_completed += 1
    provider.total_earnings += gig.price
    
    # 4. Update Job Readiness Score
    provider.job_readiness_score = calculate_job_readiness(provider)
    
    # 5. Finalize Gig
    gig.status = "completed"
    gig.completed_at = datetime.utcnow()

    # Save updates to DB
    await provider.save()
    await gig.save()

    return {
        "status": "success", 
        "new_score": provider.job_readiness_score,
        "pow_id": str(pow_entry.id)
    }
