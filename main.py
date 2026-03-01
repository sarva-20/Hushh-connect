from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.ai_routes import router as ai_router
from routers.gig_routes import router as gig_router
from routers.user_routes import router as user_router

from services.db_service import get_all_users, get_all_gigs
from ai.vector_store import rebuild_vector_store


app = FastAPI(
    title="Hushh Connect AI Backend",
    version="1.0.0",
)


# ---------------------------------------------------
# CORS
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------
# Include Routers
# ---------------------------------------------------

app.include_router(ai_router)
app.include_router(gig_router)
app.include_router(user_router)


# ---------------------------------------------------
# Health Check
# ---------------------------------------------------

@app.get("/")
def health_check():
    return {"status": "AI backend running"}


# ---------------------------------------------------
# Startup Vector Rebuild
# ---------------------------------------------------

@app.on_event("startup")
def startup_vector_rebuild():
    try:
        users = get_all_users()
        gigs = get_all_gigs()

        if users and gigs:
            rebuild_vector_store(users, gigs)
            print("Vector store rebuilt on startup.")
        else:
            print("No users or gigs found at startup. Skipping rebuild.")

    except Exception as e:
        print(f"Startup rebuild failed: {e}")