from datetime import datetime
from bson import ObjectId
from services.mongo import get_database

db = get_database()


# -----------------------------
# Helpers
# -----------------------------

def serialize_doc(doc):
    if not doc:
        return None

    doc["id"] = doc.get("user_id") or doc.get("gig_id")
    doc["_id"] = str(doc["_id"])
    return doc


# -----------------------------
# Users
# -----------------------------

def get_users_by_college(college_id: str):
    users = list(db.users.find({"college_id": college_id}))
    return [serialize_doc(u) for u in users]


def get_all_users():
    users = list(db.users.find())
    return [serialize_doc(u) for u in users]


def get_user_by_id(user_id: str):
    user = db.users.find_one({"user_id": user_id})
    return serialize_doc(user)


def create_user(user_data: dict):
    user_data["created_at"] = datetime.utcnow()
    user_data["updated_at"] = datetime.utcnow()

    db.users.insert_one(user_data)
    return get_user_by_id(user_data["user_id"])


def update_user_in_db(user_id: str, update_data: dict):
    update_data["updated_at"] = datetime.utcnow()

    db.users.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )

    return get_user_by_id(user_id)


# -----------------------------
# Gigs
# -----------------------------

def get_gigs_by_college(college_id: str):
    gigs = list(db.gigs.find({"college_id": college_id}))
    return [serialize_doc(g) for g in gigs]


def get_all_gigs():
    gigs = list(db.gigs.find())
    return [serialize_doc(g) for g in gigs]


def get_gig_by_id(gig_id: str):
    gig = db.gigs.find_one({"gig_id": gig_id})
    return serialize_doc(gig)


def save_gig_to_db(gig_data: dict):
    gig_data["gig_id"] = f"gig_{ObjectId()}"
    gig_data["created_at"] = datetime.utcnow()
    gig_data["status"] = "open"

    db.gigs.insert_one(gig_data)

    return get_gig_by_id(gig_data["gig_id"])


# -----------------------------
# Bids
# -----------------------------

def create_bid(bid_data: dict):
    bid_data["created_at"] = datetime.utcnow()
    bid_data["status"] = "pending"

    db.bids.insert_one(bid_data)
    return bid_data


def get_bids_for_gig(gig_id: str):
    bids = list(db.bids.find({"gig_id": gig_id}))
    for bid in bids:
        bid["_id"] = str(bid["_id"])
    return bids


# -----------------------------
# Proof of Work
# -----------------------------

def create_proof_of_work(data: dict):
    data["completed_at"] = datetime.utcnow()
    db.proof_of_work.insert_one(data)
    return data