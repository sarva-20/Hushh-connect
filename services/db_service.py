from datetime import datetime
from bson import ObjectId
from services.mongo import get_database

db = get_database()


# =====================================================
# Helper
# =====================================================

def serialize_doc(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


# =====================================================
# USERS
# =====================================================

def create_user(user_data: dict):
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()

    # ✅ NEW FIELDS (lossless addition)
    user_data.setdefault("wallet_balance", 1000)   # starter credits
    user_data.setdefault("role", "student")        # student / alumni / external
    user_data.setdefault("total_xp", 0)
    user_data.setdefault("total_gigs_posted", 0)
    user_data.setdefault("total_gigs_completed", 0)
    user_data.setdefault("rating", 0)
    user_data.setdefault("rating_count", 0)
    user_data.setdefault("unique_skills_used", 0)

    result = db.users.insert_one(user_data)
    inserted = db.users.find_one({"_id": result.inserted_id})

    return serialize_doc(inserted)


def get_user_by_id(user_id: str):
    user = db.users.find_one({"user_id": user_id})
    return serialize_doc(user)


def get_user_by_email(email: str):
    user = db.users.find_one({"email": email})
    return serialize_doc(user)


def get_all_users():
    users = list(db.users.find())
    return [serialize_doc(u) for u in users]


def get_users_by_college(college_id: str):
    users = list(db.users.find({"college_id": college_id}))
    return [serialize_doc(u) for u in users]


def update_user_in_db(user_id: str, update_data: dict):
    update_data["updated_at"] = datetime.utcnow()

    db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )

    return get_user_by_id(user_id)


def increment_user_stats(user_id: str, skill_used: str):
    user = get_user_by_id(user_id)
    if not user:
        return None

    total_completed = user.get("total_gigs_completed", 0) + 1
    skills = set(user.get("skills", []))
    skills.add(skill_used)

    db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "total_gigs_completed": total_completed,
                "unique_skills_used": len(skills),
                "updated_at": datetime.utcnow()
            }
        }
    )


# =====================================================
# GIGS
# =====================================================

def save_gig_to_db(gig_data: dict):
    gig_data["gig_id"] = f"gig_{ObjectId()}"
    gig_data["created_at"] = datetime.utcnow()
    gig_data["status"] = "open"

    # ✅ Escrow fields preserved if passed
    gig_data.setdefault("escrow_amount", gig_data.get("price", 0))
    gig_data.setdefault("escrow_locked", False)

    result = db.gigs.insert_one(gig_data)
    inserted = db.gigs.find_one({"_id": result.inserted_id})

    return serialize_doc(inserted)


def get_gig_by_id(gig_id: str):
    gig = db.gigs.find_one({"gig_id": gig_id})
    return serialize_doc(gig)


def get_all_gigs():
    gigs = list(db.gigs.find())
    return [serialize_doc(g) for g in gigs]


def get_gigs_by_college(college_id: str):
    gigs = list(db.gigs.find({"college_id": college_id}))
    return [serialize_doc(g) for g in gigs]


def update_gig(gig_id: str, update_data: dict):
    update_data["updated_at"] = datetime.utcnow()

    db.gigs.update_one(
        {"gig_id": gig_id},
        {"$set": update_data}
    )

    return get_gig_by_id(gig_id)


# =====================================================
# BIDS
# =====================================================

def create_bid(bid_data: dict):
    bid_data["bid_id"] = f"bid_{ObjectId()}"
    bid_data["created_at"] = datetime.utcnow()
    bid_data["status"] = "pending"

    result = db.bids.insert_one(bid_data)
    inserted = db.bids.find_one({"_id": result.inserted_id})

    return serialize_doc(inserted)


def get_bid_by_id(bid_id: str):
    bid = db.bids.find_one({"bid_id": bid_id})
    return serialize_doc(bid)


def update_bid(bid_id: str, update_data: dict):
    update_data["updated_at"] = datetime.utcnow()

    db.bids.update_one(
        {"bid_id": bid_id},
        {"$set": update_data}
    )

    return get_bid_by_id(bid_id)


def reject_other_bids(gig_id: str, accepted_bid_id: str):
    db.bids.update_many(
        {"gig_id": gig_id, "bid_id": {"$ne": accepted_bid_id}},
        {"$set": {"status": "rejected", "updated_at": datetime.utcnow()}}
    )


# =====================================================
# PROOF OF WORK
# =====================================================

def create_proof_of_work(data: dict):
    data["created_at"] = datetime.utcnow()

    result = db.proof_of_work.insert_one(data)
    inserted = db.proof_of_work.find_one({"_id": result.inserted_id})

    return serialize_doc(inserted)


def get_proof_by_gig(gig_id: str):
    proof = db.proof_of_work.find_one({"gig_id": gig_id})
    return serialize_doc(proof)


# =====================================================
# RATING + READINESS
# =====================================================

def update_user_rating(user_id: str, new_rating: float):
    user = get_user_by_id(user_id)
    if not user:
        return None

    current_avg = user.get("rating", 0)
    rating_count = user.get("rating_count", 0)

    total_score = current_avg * rating_count + new_rating
    new_count = rating_count + 1
    new_avg = round(total_score / new_count, 2)

    db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "rating": new_avg,
                "rating_count": new_count,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return get_user_by_id(user_id)


def calculate_job_readiness(user: dict):
    completed = user.get("total_gigs_completed", 0)
    rating = user.get("rating", 0)
    skills = user.get("unique_skills_used", 0)

    score = min(completed * 10, 40)
    score += min(rating * 10, 40)
    score += min(skills * 5, 20)

    return round(score, 2)


def update_job_readiness(user_id: str):
    user = get_user_by_id(user_id)
    if not user:
        return None

    score = calculate_job_readiness(user)

    db.users.update_one(
        {"user_id": user_id},
        {"$set": {"job_readiness_score": score}}
    )

    return score