from beanie import Document, Link
from .user import User
from .gig import Gig

class ProofOfWork(Document):
    gig: Link[Gig]
    provider: Link[User]
    requester: Link[User]
    rating: int # 1-5
    review: str
    card_url: str # Cloudinary PNG