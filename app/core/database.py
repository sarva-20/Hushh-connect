from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.gig import Gig
from app.models.user import User
from app.models.proof_of_work import ProofOfWork
from app.core.config import settings

async def init_db():
    # Create Motor client
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    
    # Initialize beanie with the database and document models
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[Gig, User, ProofOfWork]
    )