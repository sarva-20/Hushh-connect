import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "hushh_connect")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print(f"Connected to database: {DB_NAME}")

# --------------------------------------------------
# HARD RESET (DROP COLLECTIONS)
# --------------------------------------------------

collections = ["users", "gigs", "bids", "proof_of_work"]

for collection in collections:
    if collection in db.list_collection_names():
        db[collection].drop()
        print(f"Dropped collection: {collection}")

print("All old collections removed.\n")

# --------------------------------------------------
# USERS COLLECTION
# --------------------------------------------------

db.create_collection("users")

db.users.create_index("user_id", unique=True)
db.users.create_index("email", unique=True)
db.users.create_index("role")
db.users.create_index("college_id")

print("Users collection created and indexed")

# --------------------------------------------------
# GIGS COLLECTION
# --------------------------------------------------

db.create_collection("gigs")

db.gigs.create_index("gig_id", unique=True)
db.gigs.create_index("college_id")
db.gigs.create_index("status")
db.gigs.create_index("posted_by")

print("Gigs collection created and indexed")

# --------------------------------------------------
# BIDS COLLECTION
# --------------------------------------------------

db.create_collection("bids")

db.bids.create_index("gig_id")
db.bids.create_index("user_id")
db.bids.create_index("status")

print("Bids collection created and indexed")

# --------------------------------------------------
# PROOF OF WORK COLLECTION
# --------------------------------------------------

db.create_collection("proof_of_work")

db.proof_of_work.create_index("gig_id")
db.proof_of_work.create_index("provider_id")

print("Proof of work collection created and indexed")

print("\nDatabase reset complete.")