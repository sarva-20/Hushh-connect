from services.mongo import get_database

db = get_database()

# Insert one test user
db.users.insert_one({
    "user_id": "user_1",
    "name": "Test User",
    "college_id": "kpriet",
    "description": "React developer",
    "skills": ["react", "javascript"],
    "rating": 4.5,
    "total_gigs_completed": 2,
})

# Insert one test gig
db.gigs.insert_one({
    "gig_id": "gig_1",
    "title": "Build Landing Page",
    "description": "Need a React landing page",
    "skill_tags": ["react"],
    "college_id": "kpriet",
    "status": "open",
})

print("Inserted test data")