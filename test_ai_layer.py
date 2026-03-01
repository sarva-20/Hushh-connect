from ai.vector_store import rebuild_vector_store
from ai.matching_engine import suggest_gigs_for_user
from ai.llm_service import enhance_gig_post, suggest_price

# -----------------------------
# Mock Data
# -----------------------------

users = [
    {
        "id": "u1",
        "description": "Frontend React developer with API integration experience",
        "skills": ["react", "javascript", "api"],
    },
    {
        "id": "u2",
        "description": "Backend Python developer with FastAPI and MongoDB experience",
        "skills": ["python", "fastapi", "mongodb"],
    },
    {
        "id": "u3",
        "description": "UI designer and video editor",
        "skills": ["figma", "design", "video editing"],
    },
]

gigs = [
    {
        "id": "g1",
        "description": "Build a React dashboard with API integration",
        "skill_tags": ["react", "api"],
        "deadline_hours": 24,
        "hours_since_posted": 5,
    },
    {
        "id": "g2",
        "description": "Need help building FastAPI backend",
        "skill_tags": ["python", "fastapi"],
        "deadline_hours": 72,
        "hours_since_posted": 10,
    },
    {
        "id": "g3",
        "description": "Create poster design and short promotional video",
        "skill_tags": ["design", "video editing"],
        "deadline_hours": 36,
        "hours_since_posted": 2,
    },
]

# -----------------------------
# Build Vector Store
# -----------------------------

print("Rebuilding vector store...")
rebuild_vector_store(users, gigs)

# -----------------------------
# Suggest Gigs for User u1
# -----------------------------

print("\nSuggestions for user u1:\n")
suggestions = suggest_gigs_for_user(users[0], gigs, users)

for s in suggestions:
    print(s)

# -----------------------------
# LLM TEST (optional)
# -----------------------------

print("\nTesting LLM enhancement...\n")

enhanced = enhance_gig_post(
    title="Need React dashboard",
    raw_description="Need someone to build a dashboard using React.",
    skills=["react", "api"]
)

print(enhanced)

price = suggest_price(
    title="Need React dashboard",
    description=enhanced["enhanced_description"],
    skills=["react", "api"]
)

print(price)

from ai.reputation_engine import calculate_job_readiness

print("\nReputation Test:\n")

user_stats = {
    "total_gigs_completed": 6,
    "rating": 4.6,
    "unique_skills_used": 5,
    "gigs_last_30_days": 2,
    "total_assigned_gigs": 7,
}

print(calculate_job_readiness(user_stats))

from ai.leaderboard_engine import generate_leaderboard

print("\nLeaderboard Test:\n")

leaderboard_users = [
    {
        "id": "u1",
        "name": "Arun",
        "department": "CSE",
        "total_gigs_completed": 6,
        "rating": 4.6,
        "unique_skills_used": 5,
        "gigs_last_30_days": 2,
        "total_assigned_gigs": 7,
    },
    {
        "id": "u2",
        "name": "Divya",
        "department": "ECE",
        "total_gigs_completed": 3,
        "rating": 4.9,
        "unique_skills_used": 3,
        "gigs_last_30_days": 3,
        "total_assigned_gigs": 3,
    },
]

print(generate_leaderboard(leaderboard_users))