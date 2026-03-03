from fastapi import APIRouter
from services.db_service import get_all_users

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/")
def leaderboard():
    users = get_all_users()

    ranked = sorted(
        users,
        key=lambda u: u.get("job_readiness_score", 0),
        reverse=True
    )

    return ranked[:10]