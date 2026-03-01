from ai.vector_store import rebuild_vector_store
from services.db_service import (
    get_users_by_college,
    get_gigs_by_college,
)


def rebuild_vectors_for_college(college_id: str):
    try:
        users = get_users_by_college(college_id)
        gigs = get_gigs_by_college(college_id)

        rebuild_vector_store(users, gigs)

        print(f"Vector store rebuilt for college: {college_id}")

    except Exception as e:
        print(f"Vector rebuild failed for {college_id}: {e}")