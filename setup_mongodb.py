import os
from pymongo import MongoClient
from pymongo.errors import CollectionInvalid
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "hushh_connect")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print(f"Connected to database: {DB_NAME}")


# --------------------------------------------------
# USERS COLLECTION
# --------------------------------------------------

try:
    db.create_collection("users")
    print("Created 'users' collection")
except CollectionInvalid:
    print("'users' collection already exists")

db.users.create_index("user_id", unique=True)
db.users.create_index("college_id")
db.users.create_index("skills")

print("Indexes created for users")


# --------------------------------------------------
# GIGS COLLECTION
# --------------------------------------------------

try:
    db.create_collection("gigs")
    print("Created 'gigs' collection")
except CollectionInvalid:
    print("'gigs' collection already exists")

db.gigs.create_index("gig_id", unique=True)
db.gigs.create_index("college_id")
db.gigs.create_index("status")
db.gigs.create_index("skill_tags")

print("Indexes created for gigs")


# --------------------------------------------------
# BIDS COLLECTION
# --------------------------------------------------

try:
    db.create_collection("bids")
    print("Created 'bids' collection")
except CollectionInvalid:
    print("'bids' collection already exists")

db.bids.create_index("gig_id")
db.bids.create_index("user_id")

print("Indexes created for bids")


# --------------------------------------------------
# PROOF OF WORK COLLECTION
# --------------------------------------------------

try:
    db.create_collection("proof_of_work")
    print("Created 'proof_of_work' collection")
except CollectionInvalid:
    print("'proof_of_work' collection already exists")

db.proof_of_work.create_index("gig_id")
db.proof_of_work.create_index("provider_id")

print("Indexes created for proof_of_work")


print("\nMongoDB setup complete.")