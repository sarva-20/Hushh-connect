from beanie import Document, Indexed, Link
from pydantic import Field
from typing import List, Optional
from datetime import datetime, timedelta
from .user import User

class Gig(Document):
    title: Indexed(str)
    description: str
    category: str = Field(..., pattern="^(Tech|Creative|Academic|Other)$")
    price: float
    price_type: str = "fixed" # fixed / negotiable
    
    # Status Management
    status: str = "open" # open | in_progress | completed
    posted_by: Link[User]
    assigned_to: Optional[Link[User]] = None
    
    # Matching & AI Tags
    skill_tags: List[str] = []
    is_alumni_eligible: bool = False
    
    # Time Tracking
    deadline: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    class Settings:
        name = "gigs"
        # Indexing for faster searching on the feed
        indexes = ["status", "category", "created_at"]