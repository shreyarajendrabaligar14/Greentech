from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import (
    activities,
    dashboard,
    analytics,
    targets,
    challenges,
    leaderboard,
    settings,
    auth,
    chatbot,
)

app = FastAPI(
    title="CarbonTrack AI REST API",
    description="Green Tech & Sustainability Carbon Accounting API for Hack Fest 2026",
    version="1.0.0"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook to initialize SQLite tables
@app.on_event("startup")
def on_startup():
    init_db()

# Health check endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CarbonTrack AI API",
        "version": "1.0.0",
        "database": "SQLite (carbontrack.db)",
        "timestamp": "2026-10-28"
    }

# Include modular feature routers
app.include_router(activities.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(targets.router)
app.include_router(challenges.router)
app.include_router(leaderboard.router)
app.include_router(settings.router)
app.include_router(auth.router)
app.include_router(chatbot.router)

@app.get("/")
def root():
    return {
        "app": "CarbonTrack AI",
        "description": "Green Tech & Sustainability Platform",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", "8081"))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
