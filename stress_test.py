import random
import string
import time

from ai.vector_store import rebuild_vector_store
from ai.matching_engine import suggest_gigs_for_user
from ai.leaderboard_engine import generate_leaderboard


# ---------------------------------------
# Helper Generators
# ---------------------------------------

skills_pool = [
    "react", "python", "fastapi", "mongodb",
    "design", "video editing", "ml",
    "data analysis", "java", "flutter",
    "devops", "aws", "figma", "nodejs"
]


def random_skills():
    return random.sample(skills_pool, random.randint(2, 5))


def random_description():
    return " ".join(random.sample(skills_pool, random.randint(3, 6)))


# ---------------------------------------
# Generate Users
# ---------------------------------------

NUM_USERS = 1000
NUM_GIGS = 300

users = []

for i in range(NUM_USERS):
    users.append({
        "id": f"user_{i}",
        "name": f"User {i}",
        "department": random.choice(["CSE", "ECE", "MECH"]),
        "description": random_description(),
        "skills": random_skills(),
        "total_gigs_completed": random.randint(0, 10),
        "rating": round(random.uniform(3.5, 5.0), 2),
        "unique_skills_used": random.randint(1, 6),
        "gigs_last_30_days": random.randint(0, 5),
        "total_assigned_gigs": random.randint(0, 10),
    })


# ---------------------------------------
# Generate Gigs
# ---------------------------------------

gigs = []

for i in range(NUM_GIGS):
    gigs.append({
        "id": f"gig_{i}",
        "description": random_description(),
        "skill_tags": random_skills(),
        "deadline_hours": random.randint(12, 96),
        "hours_since_posted": random.randint(1, 72),
    })


# ---------------------------------------
# Stress Test
# ---------------------------------------

print("\n--- Starting Stress Test ---\n")

start = time.time()
rebuild_vector_store(users, gigs)
print("Vector store built in:", round(time.time() - start, 3), "seconds")

# Test suggestion engine for one random user
test_user = users[0]

start = time.time()
suggestions = suggest_gigs_for_user(test_user, gigs, top_k=50)
print("Suggestion engine ran in:", round(time.time() - start, 3), "seconds")
print("Top suggestion:", suggestions[0])

# Test leaderboard
start = time.time()
leaderboard = generate_leaderboard(users, current_user_id=test_user["id"])
print("Leaderboard generated in:", round(time.time() - start, 3), "seconds")

print("\nTop 3 Leaderboard:\n")
for row in leaderboard["top_10"][:3]:
    print(row)

print("\nCurrent User Rank:\n")
print(leaderboard["current_user_rank"])

print("\n--- Stress Test Complete ---\n")