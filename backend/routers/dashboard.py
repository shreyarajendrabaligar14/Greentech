from fastapi import APIRouter
from database import get_db
from models import DashboardSummaryResponse, MonthlyTrendItem
from datetime import datetime

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary():
    with get_db() as conn:
        cursor = conn.cursor()

        # Fetch all records ordered chronologically
        rows = cursor.execute("""
            SELECT id, date, total_emissions, electricity_emissions,
                   transportation_emissions, fuel_emissions, waste_emissions
            FROM activities
            ORDER BY date ASC, id ASC
        """).fetchall()

        if not rows:
            return DashboardSummaryResponse(
                total_emissions=0.0,
                electricity_emissions=0.0,
                transportation_emissions=0.0,
                fuel_emissions=0.0,
                waste_emissions=0.0,
                activity_count=0,
                change_pct=None,
                monthly_trends=[]
            )

        # Most recent record represents current footprint rate
        latest = rows[-1]
        total_elec = sum(r["electricity_emissions"] for r in rows)
        total_trans = sum(r["transportation_emissions"] for r in rows)
        total_fuel = sum(r["fuel_emissions"] for r in rows)
        total_waste = sum(r["waste_emissions"] for r in rows)
        total_all = sum(r["total_emissions"] for r in rows)

        # Percentage change between latest and previous record
        change_pct = None
        if len(rows) >= 2:
            prev = rows[-2]
            if prev["total_emissions"] > 0:
                change = ((latest["total_emissions"] - prev["total_emissions"]) / prev["total_emissions"]) * 100
                change_pct = round(change, 1)

        # Group by month for historical trend
        month_map = {}
        for r in rows:
            date_str = r["date"]
            try:
                dt = datetime.strptime(date_str, "%Y-%m-%d")
                month_key = dt.strftime("%b %y")
            except Exception:
                month_key = date_str[:7]
            month_map[month_key] = month_map.get(month_key, 0.0) + r["total_emissions"]

        monthly_trends = [
            MonthlyTrendItem(month=k, emissions=round(v, 1))
            for k, v in month_map.items()
        ]

        # Use latest log for primary snapshot totals if multiple logs exist
        return DashboardSummaryResponse(
            total_emissions=round(latest["total_emissions"], 1),
            electricity_emissions=round(latest["electricity_emissions"], 1),
            transportation_emissions=round(latest["transportation_emissions"], 1),
            fuel_emissions=round(latest["fuel_emissions"], 1),
            waste_emissions=round(latest["waste_emissions"], 1),
            activity_count=len(rows),
            change_pct=change_pct,
            monthly_trends=monthly_trends
        )
