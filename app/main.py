from fastapi import FastAPI
from app.core.database import init_db
from app.api.v1 import auth, gigs, users

app = FastAPI(title="Hushh Connect API")

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(gigs.router, prefix="/api/v1/gigs", tags=["gigs"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
