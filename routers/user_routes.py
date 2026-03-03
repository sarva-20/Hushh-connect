from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, Any

from dependencies.auth import authenticate_login, register_user
from services.db_service import (
    get_user_by_id,
    update_user_in_db,
)
from services.vector_rebuild_service import rebuild_vectors_for_college

router = APIRouter(prefix="/users", tags=["Users"])


class LoginPayload(BaseModel):
    identifier: str


class SignInPayload(BaseModel):
    user_id: str = Field(min_length=2, max_length=64)
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=200)
    college_id: str = "kpriet"
    department: str = ""
    year: str = ""


@router.post("/login")
def login_user(payload: LoginPayload):
    user = authenticate_login(payload.identifier)
    return {
        "message": "Login successful",
        "user_id": user["user_id"],
        "user": user,
    }


@router.post("/signin")
def signin_user(payload: SignInPayload):
    user = register_user(payload.model_dump())
    return {
        "message": "Sign in successful",
        "user_id": user["user_id"],
        "user": user,
    }


@router.put("/{user_id}")
def update_user(
    user_id: str,
    update_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
):
    """
    Updatable semantic fields:
    - description
    - skills
    """

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = update_user_in_db(user_id, update_data)

    # Trigger rebuild only if semantic fields changed
    if "skills" in update_data or "description" in update_data:
        background_tasks.add_task(
            rebuild_vectors_for_college,
            user["college_id"],
        )

    return {
        "status": "user updated",
        "user": updated_user,
    }


@router.get("/{user_id}")
def get_user(user_id: str):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
