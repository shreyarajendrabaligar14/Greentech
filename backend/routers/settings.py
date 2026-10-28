from fastapi import APIRouter
from typing import Dict, Any
from database import get_db, reset_database

router = APIRouter(tags=["Settings & Data Management"])

@router.get("/api/settings")
def get_settings():
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("SELECT key, value FROM settings").fetchall()
        settings_dict = {r["key"]: r["value"] for r in rows}
        return {
            "profile_type": settings_dict.get("profile_type", "individual"),
            "grid_factor": float(settings_dict.get("grid_factor", "0.82")),
            "org_name": settings_dict.get("org_name", "Eco Pioneer"),
            "database_file": "backend/carbontrack.db",
            "storage_mode": "Local SQLite"
        }

@router.post("/api/settings")
def update_settings(payload: Dict[str, Any]):
    with get_db() as conn:
        cursor = conn.cursor()
        for k, v in payload.items():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, str(v)))
        return {"status": "success", "updated": payload}

@router.post("/api/data/reset")
def reset_data():
    reset_database()
    return {"status": "success", "message": "All local activity records have been purged"}
