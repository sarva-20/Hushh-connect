from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

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
# REQUEST MODELS
# =====================================================

class CreateGigRequest(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    college_id: Optional[str] = None


class SubmitBidRequest(BaseModel):
    message: str
    bid_price: float


class CompleteGigRequest(BaseModel):
    rating: int
    review: Optional[str] = None
    skill_used: Optional[str] = None


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
    gig_data: CreateGigRequest,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") == "external":
        raise HTTPException(status_code=403, detail="External users cannot post gigs")
    title = (gig_data.title or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    price = float(gig_data.price)
    if price <= 0:
        raise HTTPException(status_code=400, detail="Invalid gig price")

    user = db.users.find_one({"user_id": current_user["user_id"]})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("wallet_balance", 0) < price:
        raise HTTPException(
            status_code=400,
            detail="Insufficient wallet balance to post this gig"
        )

    # LOCK ESCROW
    db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {"wallet_balance": -price}}
    )

    payload = {
        "title": title,
        "description": (gig_data.description or "").strip(),
        "price": price,
        "posted_by": current_user["user_id"],
        "college_id": gig_data.college_id or current_user.get("college_id"),
        "status": "open",
        "escrow_amount": price,
        "escrow_locked": True,
    }

    created = save_gig_to_db(payload)

    # XP + Post Count
    db.users.update_one(
        {"user_id": current_user["user_id"]},
        {
            "$inc": {
                "total_xp": 20,
                "total_gigs_posted": 1
            }
        }
    )

    return created


# =====================================================
# Submit Bid
# =====================================================

@router.post("/{gig_id}/bid")
def submit_bid(
    gig_id: str,
    bid_data: SubmitBidRequest,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") == "external":
        raise HTTPException(status_code=403, detail="External users cannot bid")
    gig = get_gig_by_id(gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    if gig.get("status") != "open":
        raise HTTPException(status_code=400, detail="Gig not open")

    if gig.get("posted_by") == current_user["user_id"]:
        raise HTTPException(status_code=403, detail="You cannot bid on your own gig")

    message = (bid_data.message or "").strip()
    bid_price = bid_data.bid_price

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

    bid_price = float(bid.get("bid_price", 0))

    # 🔒 Wallet Check
    requester = db.users.find_one({"user_id": current_user["user_id"]})
    if not requester:
        raise HTTPException(status_code=404, detail="Requester not found")

    if requester.get("wallet_balance", 0) < bid_price:
        raise HTTPException(
            status_code=400,
            detail="Insufficient wallet balance to accept this bid"
        )

    # 💰 Deduct Wallet
    db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {"wallet_balance": -bid_price}}
    )

    # 🏦 Lock Escrow in Gig
    update_gig(
        gig_id,
        {
            "status": "assigned",
            "assigned_to": bid["user_id"],
            "escrow_amount": bid_price,
            "escrow_locked": True
        }
    )

    update_bid(bid_id, {"status": "accepted"})
    reject_other_bids(gig_id, bid_id)

    logger.info(
        f"Bid accepted | gig={gig_id} | bid={bid_id} | escrow={bid_price}"
    )

    return {"message": "Bid accepted and escrow locked"}

# =====================================================
# Complete Gig
# =====================================================

@router.post("/{gig_id}/complete")
def complete_gig(
    gig_id: str,
    payload: CompleteGigRequest,
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

    rating = payload.rating
    review = payload.review
    skill_used = payload.skill_used

    if rating is None:
        raise HTTPException(status_code=400, detail="Rating required")

    update_gig(gig_id, {"status": "completed"})
    escrow_amount = gig.get("escrow_amount", 0)

    #  Transfer to provider
    db.users.update_one(
        {"user_id": provider_id},
        {"$inc": {"wallet_balance": escrow_amount}}
    )

    #  Unlock escrow
    update_gig(gig_id, {
        "status": "completed",
        "escrow_locked": False
    })

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