from fastapi import APIRouter
from database import get_db
from models import TargetModel

router = APIRouter(prefix="/api/targets", tags=["Targets"])

@router.get("", response_model=TargetModel)
def get_targets():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT reduction_percentage, target_year, baseline_emissions FROM targets LIMIT 1")
        row = cursor.fetchone()
        if row:
            return TargetModel(
                reduction_percentage=row["reduction_percentage"],
                target_year=row["target_year"],
                baseline_emissions=row["baseline_emissions"]
            )
        return TargetModel(reduction_percentage=20.0, target_year="2026", baseline_emissions=0.0)

@router.post("", response_model=TargetModel)
def save_targets(payload: TargetModel):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM targets LIMIT 1")
        row = cursor.fetchone()
        if row:
            cursor.execute("""
                UPDATE targets
                SET reduction_percentage = ?, target_year = ?, baseline_emissions = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (payload.reduction_percentage, payload.target_year, payload.baseline_emissions, row["id"]))
        else:
            cursor.execute("""
                INSERT INTO targets (reduction_percentage, target_year, baseline_emissions)
                VALUES (?, ?, ?)
            """, (payload.reduction_percentage, payload.target_year, payload.baseline_emissions))

        return payload
