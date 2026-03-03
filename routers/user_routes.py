from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
from datetime import datetime
import re
import uuid
from pydantic import BaseModel

from services.db_service import (
    create_user,
    get_user_by_email,
    get_user_by_id,
)
from ai.llm_service import enhance_description  # since yours is inside ai/

router = APIRouter(prefix="/users", tags=["Users"])


# ===============================
# REQUEST MODELS
# ===============================

class LoginRequest(BaseModel):
    identifier: str


class SigninRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    batch: Optional[str] = None
    description: Optional[str] = None
    is_alumni: bool = False


class EnhanceDescriptionRequest(BaseModel):
    description: str


# ===============================
# LOGIN (Email Only)
# ===============================

@router.post("/login")
def login(data: LoginRequest):

    identifier = (data.identifier or "").strip().lower()

    if not identifier:
        raise HTTPException(status_code=400, detail="Email required")

    user = get_user_by_email(identifier)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "message": "Login successful",
        "user_id": user["user_id"]
    }


# ===============================
# GET USER BY ID
# ===============================

@router.get("/{user_id}")
def get_user(user_id: str):
    user = get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


# ===============================
# SIGNIN (Auto ID Generation)
# ===============================

@router.post("/signin")
def signin(data: SigninRequest):

    name = (data.name or "").strip()
    email = (data.email or "").strip().lower()
    phone = (data.phone or "").strip() if data.phone else None
    batch = (data.batch or "").strip() if data.batch else None
    description = (data.description or "").strip() if data.description else None
    is_alumni = bool(data.is_alumni)

    if not name or not email:
        raise HTTPException(status_code=400, detail="Name and email required")

    if get_user_by_email(email):
        raise HTTPException(status_code=400, detail="Email already registered")

    # -------------------------
    # ROLE DETECTION
    # -------------------------

    internal_pattern = r"(ac\.in|edu)$"
    is_internal = re.search(internal_pattern, email)

    if not is_internal:
        role = "external"
    else:
        role = "alumni" if is_alumni else "student"

    # -------------------------
    # AUTO GENERATE USER ID
    # -------------------------

    user_id = f"user_{uuid.uuid4().hex[:8]}"

    # -------------------------
    # CREATE USER
    # -------------------------

    user_payload = {
        "user_id": user_id,
        "name": name,
        "email": email,
        "phone": phone if phone else None,
        "batch": batch if batch else None,
        "description": description,
        "role": role,
        "wallet_balance": 1000,
        "total_xp": 0,
        "total_gigs_posted": 0,
        "total_gigs_completed": 0,
        "rating": 0,
        "rating_count": 0,
        "job_readiness_score": 0,
        "unique_skills_used": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    created = create_user(user_payload)

    return {
        "message": "Account created successfully",
        "user_id": created["user_id"]
    }


# ===============================
# ENHANCE DESCRIPTION
# ===============================

@router.post("/enhance-description")
def enhance_user_description(data: EnhanceDescriptionRequest):

    description = (data.description or "").strip()

    if not description:
        raise HTTPException(status_code=400, detail="Description required")

    try:
        enhanced = enhance_description(description)
        return {"enhanced_description": enhanced}
    except:
        return {"enhanced_description": description}