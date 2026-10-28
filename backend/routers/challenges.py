from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db
from models import ChallengeItem, ChallengeToggleRequest

router = APIRouter(prefix="/api/challenges", tags=["Challenges"])

@router.get("", response_model=List[ChallengeItem])
def get_challenges():
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("SELECT * FROM challenges ORDER BY id ASC").fetchall()
        return [
            ChallengeItem(
                id=r["id"],
                title=r["title"],
                description=r["description"],
                category=r["category"],
                duration=r["duration"],
                impact=r["impact"],
                points=r["points"],
                completed=bool(r["completed"])
            )
            for r in rows
        ]

@router.post("/{challenge_id}/toggle", response_model=ChallengeItem)
def toggle_challenge(challenge_id: int, payload: ChallengeToggleRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE challenges SET completed = ? WHERE id = ?", (1 if payload.completed else 0, challenge_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Challenge not found")

        row = cursor.execute("SELECT * FROM challenges WHERE id = ?", (challenge_id,)).fetchone()
        return ChallengeItem(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            category=row["category"],
            duration=row["duration"],
            impact=row["impact"],
            points=row["points"],
            completed=bool(row["completed"])
        )
