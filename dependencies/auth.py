from fastapi import Header, HTTPException
from services.db_service import create_user, get_user_by_email, get_user_by_id


def _normalize_identifier(identifier: str) -> str:
    value = (identifier or "").strip()
    if not value:
        raise HTTPException(status_code=400, detail="Login identifier is required")
    return value


def authenticate_login(identifier: str):
    normalized = _normalize_identifier(identifier)

    # Allow login by either user_id or email.
    user = get_user_by_id(normalized)
    if not user and "@" in normalized:
        user = get_user_by_email(normalized.lower())

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return user


def register_user(payload: dict):
    user_id = _normalize_identifier(payload.get("user_id", ""))
    email = _normalize_identifier(payload.get("email", "")).lower()
    name = _normalize_identifier(payload.get("name", ""))

    if get_user_by_id(user_id):
        raise HTTPException(status_code=409, detail="User ID already exists")

    if get_user_by_email(email):
        raise HTTPException(status_code=409, detail="Email already exists")

    user_data = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "college_id": (payload.get("college_id") or "kpriet").strip() or "kpriet",
        "department": (payload.get("department") or "").strip(),
        "year": (payload.get("year") or "").strip(),
        "description": (payload.get("description") or "").strip(),
        "skills": payload.get("skills") or [],
        "rating": 0,
        "rating_count": 0,
        "total_gigs_completed": 0,
        "unique_skills_used": 0,
        "job_readiness_score": 0,
        "total_xp": 0,
        "badges": [],
    }

    return create_user(user_data)

def get_current_user(x_user_id: str = Header(...)):
    user = authenticate_login(x_user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    return user
