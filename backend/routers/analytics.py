from fastapi import APIRouter
from database import get_db
from models import CalculationRequest, CalculationResponse
from services.calculator import calculate_footprint

router = APIRouter(tags=["Analytics & Calculations"])

@router.post("/api/calculate", response_model=CalculationResponse)
def calculate_emissions_endpoint(payload: CalculationRequest):
    result = calculate_footprint(
        electricity=payload.electricity,
        transportation=payload.transportation,
        fuel=payload.fuel,
        waste=payload.waste
    )
    return CalculationResponse(
        total_emissions=result["total_emissions"],
        total_monthly_normalized=result["total_monthly_normalized"],
        breakdown=result["breakdown"],
        details=result["details"]
    )

@router.get("/api/analytics")
def get_analytics():
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute("""
            SELECT id, title, date, total_emissions, electricity_emissions,
                   transportation_emissions, fuel_emissions, waste_emissions
            FROM activities
            ORDER BY date ASC
        """).fetchall()

        total_elec = sum(r["electricity_emissions"] for r in rows)
        total_trans = sum(r["transportation_emissions"] for r in rows)
        total_fuel = sum(r["fuel_emissions"] for r in rows)
        total_waste = sum(r["waste_emissions"] for r in rows)
        total_all = sum(r["total_emissions"] for r in rows)

        categories = [
            {"category": "Electricity", "emissions": round(total_elec, 1), "color": "#f59e0b"},
            {"category": "Transportation", "emissions": round(total_trans, 1), "color": "#3b82f6"},
            {"category": "Fuel", "emissions": round(total_fuel, 1), "color": "#ef4444"},
            {"category": "Waste", "emissions": round(total_waste, 1), "color": "#10b981"},
        ]
        sorted_cat = sorted(categories, key=lambda x: x["emissions"], reverse=True)
        highest_category = sorted_cat[0] if sorted_cat and sorted_cat[0]["emissions"] > 0 else None

        return {
            "total_emissions": round(total_all, 1),
            "category_totals": categories,
            "highest_category": highest_category,
            "record_count": len(rows),
        }
