from fastapi import APIRouter, HTTPException
from app.models.user import User

router = APIRouter()

@router.get("/check-status/{email}")
async def check_user_status(email: str):
    # CRITICAL: Security check for KPRIET domain
    if not email.endswith("@kpriet.ac.in"):
        raise HTTPException(status_code=403, detail="Only KPRIET emails allowed")

    user = await User.find_one(User.email == email)
    if not user:
        return {"is_registered": False, "next_step": "/onboarding"}
    
    return {"is_registered": True, "user_id": str(user.id)}