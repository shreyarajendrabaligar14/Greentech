from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
from database import get_db
from models import ActivityCreate, ActivityResponse

router = APIRouter(prefix="/api/activities", tags=["Activities"])

@router.get("", response_model=List[ActivityResponse])
def get_activities(limit: int = 50, category: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM activities ORDER BY date DESC, id DESC LIMIT ?"
        rows = cursor.execute(query, (limit,)).fetchall()
        result = []
        for r in rows:
            details = json.loads(r["details_json"]) if r["details_json"] else None
            result.append(ActivityResponse(
                id=r["id"],
                title=r["title"],
                date=r["date"],
                total_emissions=r["total_emissions"],
                electricity_emissions=r["electricity_emissions"],
                transportation_emissions=r["transportation_emissions"],
                fuel_emissions=r["fuel_emissions"],
                waste_emissions=r["waste_emissions"],
                details=details,
                created_at=r["created_at"]
            ))
        return result

@router.post("", response_model=ActivityResponse)
def create_activity(activity: ActivityCreate):
    details_str = json.dumps(activity.details) if activity.details else None
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO activities (
                title, date, total_emissions, electricity_emissions,
                transportation_emissions, fuel_emissions, waste_emissions, details_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            activity.title,
            activity.date,
            activity.total_emissions,
            activity.electricity_emissions,
            activity.transportation_emissions,
            activity.fuel_emissions,
            activity.waste_emissions,
            details_str
        ))
        act_id = cursor.lastrowid

        # Update baseline emissions in targets if baseline is currently 0
        cursor.execute("SELECT baseline_emissions FROM targets LIMIT 1")
        row = cursor.fetchone()
        if row and row["baseline_emissions"] == 0.0:
            cursor.execute("UPDATE targets SET baseline_emissions = ? WHERE id = 1", (activity.total_emissions,))

        return ActivityResponse(
            id=act_id,
            title=activity.title,
            date=activity.date,
            total_emissions=activity.total_emissions,
            electricity_emissions=activity.electricity_emissions,
            transportation_emissions=activity.transportation_emissions,
            fuel_emissions=activity.fuel_emissions,
            waste_emissions=activity.waste_emissions,
            details=activity.details
        )

@router.delete("/{activity_id}")
def delete_activity(activity_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM activities WHERE id = ?", (activity_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Activity record not found")
        return {"message": "Activity deleted successfully", "id": activity_id}
