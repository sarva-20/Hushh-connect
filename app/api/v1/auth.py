from fastapi import APIRouter, HTTPException
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class OnboardingRequest(BaseModel):
    name: str
    email: str
    photo: str
    department: str
    year: int
    referred_by: Optional[str] = None

@router.post("/onboarding")
async def complete_onboarding(data: OnboardingRequest):
    # 1. Final check for KPRIET domain
    if not data.email.endswith("@kpriet.ac.in"):
        raise HTTPException(status_code=403, detail="KPRIET email required")

    # 2. Check if user already exists
    existing_user = await User.find_one(User.email == data.email)
    if existing_user:
        return {"status": "success", "message": "User already registered", "user": existing_user}

    # 3. Create new user
    new_user = User(
        name=data.name,
        email=data.email,
        photo=data.photo,
        department=data.department,
        year=data.year,
        referred_by=data.referred_by
    )
    
    # 4. Handle Referral Logic (if applicable)
    if data.referred_by:
        referrer = await User.find_one(User.referral_code == data.referred_by)
        if referrer:
            referrer.referral_count += 1
            await referrer.save()

    await new_user.insert()
    return {"status": "created", "user_id": str(new_user.id)}