from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import Dict, Any, List

from dependencies.auth import get_current_user
from services.logger import logger
from services.db_service import (
    get_all_gigs,
    save_gig_to_db,
    create_bid,
    get_gig_by_id,
    update_gig,
    get_bid_by_id,
    update_bid,
    reject_other_bids,
    create_proof_of_work,
    increment_user_stats,
    update_user_rating,
    update_job_readiness,
)
from services.vector_rebuild_service import rebuild_vectors_for_college
from services.db_service import db


router = APIRouter(prefix="/gigs", tags=["Gigs"])


# =====================================================
# List Gigs
# =====================================================

@router.get("")
def list_gigs():
    return get_all_gigs()


# =====================================================
# Create Gig
# =====================================================

@router.post("")
def create_gig(
    gig_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    title = (gig_data.get("title") or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    payload = {
        **gig_data,
        "title": title,
        "description": (gig_data.get("description") or "").strip(),
        "posted_by": current_user["user_id"],
        "college_id": gig_data.get("college_id") or current_user.get("college_id"),
        "status": "open",
    }

    created = save_gig_to_db(payload)

    # ✅ XP + Post Count Update
    db.users.update_one(
        {"user_id": current_user["user_id"]},
        {
            "$inc": {
                "total_xp": 20,
                "total_gigs_posted": 1
            }
        }
    )

    logger.info(
        f"Gig created | gig={created.get('gig_id')} | user={current_user['user_id']}"
    )

    return created


# =====================================================
# Submit Bid
# =====================================================

@router.post("/{gig_id}/bid")
def submit_bid(
    gig_id: str,
    bid_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):

    gig = get_gig_by_id(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    if gig.get("status") != "open":
        raise HTTPException(status_code=400, detail="Gig not open")

    if gig.get("posted_by") == current_user["user_id"]:
        raise HTTPException(status_code=403, detail="You cannot bid on your own gig")

    message = (bid_data.get("message") or "").strip()
    bid_price = bid_data.get("bid_price")

    if not message:
        raise HTTPException(status_code=400, detail="Bid message required")

    if bid_price is None:
        raise HTTPException(status_code=400, detail="Bid price required")

    try:
        bid_price = float(bid_price)
    except:
        raise HTTPException(status_code=400, detail="Invalid bid price")

    gig_price = float(gig.get("price", 0))
    minimum_allowed = gig_price / 2

    if bid_price < minimum_allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum bid allowed is ₹{minimum_allowed}"
        )

    bid_payload = {
        "gig_id": gig_id,
        "user_id": current_user["user_id"],
        "message": message,
        "bid_price": bid_price,
        "status": "pending",
    }

    bid = create_bid(bid_payload)

    logger.info(
        f"Bid submitted | gig={gig_id} | user={current_user['user_id']} | price={bid_price}"
    )

    return bid

# =====================================================
# Accept Bid
# =====================================================

@router.post("/{gig_id}/accept/{bid_id}")
def accept_bid(
    gig_id: str,
    bid_id: str,
    current_user: dict = Depends(get_current_user)
):

    gig = get_gig_by_id(gig_id)
    bid = get_bid_by_id(bid_id)

    if not gig or not bid:
        raise HTTPException(status_code=404, detail="Gig or Bid not found")

    if gig.get("status") != "open":
        raise HTTPException(status_code=400, detail="Gig not open")

    if current_user["user_id"] != gig.get("posted_by"):
        raise HTTPException(status_code=403, detail="Only requester can accept bids")

    update_bid(bid_id, {"status": "accepted"})
    reject_other_bids(gig_id, bid_id)

    update_gig(
        gig_id,
        {
            "status": "assigned",
            "assigned_to": bid["user_id"]
        }
    )

    logger.info(
        f"Bid accepted | gig={gig_id} | bid={bid_id}"
    )

    return {"message": "Bid accepted"}


# =====================================================
# Complete Gig
# =====================================================

@router.post("/{gig_id}/complete")
def complete_gig(
    gig_id: str,
    payload: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):

    gig = get_gig_by_id(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    if gig.get("status") != "assigned":
        raise HTTPException(status_code=400, detail="Gig not assigned")

    if current_user["user_id"] != gig.get("posted_by"):
        raise HTTPException(status_code=403, detail="Only requester can complete")

    provider_id = gig.get("assigned_to")

    rating = payload.get("rating")
    review = payload.get("review")
    skill_used = payload.get("skill_used")

    if rating is None:
        raise HTTPException(status_code=400, detail="Rating required")

    update_gig(gig_id, {"status": "completed"})

    proof = create_proof_of_work({
        "gig_id": gig_id,
        "provider_id": provider_id,
        "requester_id": gig.get("posted_by"),
        "rating": rating,
        "review": review,
    })

    increment_user_stats(provider_id, skill_used)
    update_user_rating(provider_id, rating)
    readiness = update_job_readiness(provider_id)

    logger.info(
        f"Gig completed | gig={gig_id} | provider={provider_id} | rating={rating} | readiness={readiness}"
    )

    background_tasks.add_task(
        rebuild_vectors_for_college,
        gig.get("college_id")
    )

    return {
        "message": "Gig completed",
        "proof_of_work": proof,
        "updated_readiness": readiness
    }


# =====================================================
# List Bids (Enriched with User Name)
# =====================================================

@router.get("/{gig_id}/bids")
def list_bids(gig_id: str):

    bids = list(db.bids.find({"gig_id": gig_id}))

    enriched: List[Dict[str, Any]] = []

    for b in bids:
        user = db.users.find_one({"user_id": b["user_id"]})

        enriched.append({
            "bid_id": str(b["_id"]),
            "gig_id": b["gig_id"],
            "user_id": b["user_id"],
            "user_name": user.get("name") if user else b["user_id"],
            "status": b.get("status"),
            "bid_price": b.get("bid_price"),
            "message": b.get("message"),
        })

    return enriched