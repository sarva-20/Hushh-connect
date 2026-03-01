from beanie import Document, Indexed
from pydantic import Field, EmailStr
from typing import List, Optional
from datetime import datetime
import uuid

class User(Document):
    name: str
    email: Indexed(EmailStr, unique=True)
    photo: Optional[str] = None
    department: str = Field(..., pattern="^(CSE|CSBS|ECE|EEE|MECH|CIVIL|IT)$")
    year: int = Field(..., ge=1, le=5)  # 5 = Alumni
    is_alumni: bool = False
    
    # Skills & Bio
    skills: List[str] = []
    description: Optional[str] = None
    
    # Gamification & Metrics
    job_readiness_score: int = 0
    total_gigs_completed: int = 0
    total_earnings: float = 0.0
    rating: float = 5.0
    rating_count: int = 0
    
    # Growth System
    referral_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    referred_by: Optional[str] = None
    referral_count: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    async def before_save(self):
        """Logic: If year is 5, they are an Alumni"""
        if self.year >= 5:
            self.is_alumni = True
        else:
            self.is_alumni = False

    class Settings:
        name = "users"