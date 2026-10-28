"""
Server-side Carbon Calculation Engine for CarbonTrack AI
Follows DEFRA 2023, India CEA 2023, and US EPA WARM verified methodologies.
"""

# Period normalization multipliers to MONTHLY standard
PERIOD_MULTIPLIERS = {
    "one_time": 1.0,
    "daily": 30.417,
    "weekly": 4.345,
    "monthly": 1.0,
    "yearly": 1.0 / 12.0,
}

# Configurable reference factors (kg CO2e per unit)
EMISSION_FACTORS = {
    "electricity": 0.82,  # kg CO2e / kWh (CEA India Grid)
    "transportation": {
        "car_petrol": 0.170,  # kg CO2e / km
        "car_diesel": 0.165,
        "car_ev": 0.053,
        "motorcycle": 0.085,
        "bus": 0.050,
        "train": 0.035,
    },
    "fuel": {
        "petrol": 2.31,  # kg CO2e / Litre
        "diesel": 2.68,
        "lpg": 1.51,
        "cng": 2.75,     # kg CO2e / kg
    },
    "waste": {
        "mixed": 0.58,   # kg CO2e / kg waste
        "food": 0.62,
        "plastic": 1.43,
        "paper": 0.45,
    }
}

def calculate_electricity(kwh: float, period: str = "monthly", custom_factor: float = None) -> dict:
    factor = custom_factor if custom_factor is not None else EMISSION_FACTORS["electricity"]
    direct = kwh * factor
    multiplier = PERIOD_MULTIPLIERS.get(period, 1.0)
    normalized = direct if period == "one_time" else direct * multiplier
    return {
        "raw_input": kwh,
        "unit": "kWh",
        "period": period,
        "factor": factor,
        "factor_unit": "kg CO2e / kWh",
        "emissions": round(direct, 2),
        "normalized_monthly": round(normalized, 2),
    }

def calculate_transport(km: float, mode: str = "car_petrol", frequency: str = "weekly", custom_factor: float = None) -> dict:
    factor = custom_factor if custom_factor is not None else EMISSION_FACTORS["transportation"].get(mode, 0.170)
    direct = km * factor
    multiplier = PERIOD_MULTIPLIERS.get(frequency, 1.0)
    normalized = direct if frequency == "one_time" else direct * multiplier
    return {
        "raw_input": km,
        "unit": "km",
        "mode": mode,
        "frequency": frequency,
        "factor": factor,
        "factor_unit": "kg CO2e / km",
        "emissions": round(direct, 2),
        "normalized_monthly": round(normalized, 2),
    }

def calculate_fuel(litres: float, fuel_type: str = "petrol", period: str = "monthly", custom_factor: float = None) -> dict:
    factor = custom_factor if custom_factor is not None else EMISSION_FACTORS["fuel"].get(fuel_type, 2.31)
    direct = litres * factor
    multiplier = PERIOD_MULTIPLIERS.get(period, 1.0)
    normalized = direct if period == "one_time" else direct * multiplier
    return {
        "raw_input": litres,
        "unit": "kg" if fuel_type == "cng" else "Litres",
        "fuel_type": fuel_type,
        "period": period,
        "factor": factor,
        "factor_unit": "kg CO2e / L" if fuel_type != "cng" else "kg CO2e / kg",
        "emissions": round(direct, 2),
        "normalized_monthly": round(normalized, 2),
    }

def calculate_waste(kg: float, waste_type: str = "mixed", period: str = "monthly", custom_factor: float = None) -> dict:
    factor = custom_factor if custom_factor is not None else EMISSION_FACTORS["waste"].get(waste_type, 0.58)
    direct = kg * factor
    multiplier = PERIOD_MULTIPLIERS.get(period, 1.0)
    normalized = direct if period == "one_time" else direct * multiplier
    return {
        "raw_input": kg,
        "unit": "kg",
        "waste_type": waste_type,
        "period": period,
        "factor": factor,
        "factor_unit": "kg CO2e / kg",
        "emissions": round(direct, 2),
        "normalized_monthly": round(normalized, 2),
    }

def calculate_footprint(electricity=None, transportation=None, fuel=None, waste=None) -> dict:
    elec_res = calculate_electricity(electricity.kwh, electricity.period, electricity.custom_factor) if electricity else {"emissions": 0.0, "normalized_monthly": 0.0}
    trans_res = calculate_transport(transportation.km, transportation.mode, transportation.frequency, transportation.custom_factor) if transportation else {"emissions": 0.0, "normalized_monthly": 0.0}
    fuel_res = calculate_fuel(fuel.litres, fuel.fuel_type, fuel.period, fuel.custom_factor) if fuel else {"emissions": 0.0, "normalized_monthly": 0.0}
    waste_res = calculate_waste(waste.kg, waste.waste_type, waste.period, waste.custom_factor) if waste else {"emissions": 0.0, "normalized_monthly": 0.0}

    total_direct = round(elec_res["emissions"] + trans_res["emissions"] + fuel_res["emissions"] + waste_res["emissions"], 2)
    total_norm = round(elec_res["normalized_monthly"] + trans_res["normalized_monthly"] + fuel_res["normalized_monthly"] + waste_res["normalized_monthly"], 2)

    breakdown = [
        {"category": "Electricity", "emissions": elec_res["normalized_monthly"], "color": "#f59e0b", "share": 0},
        {"category": "Transportation", "emissions": trans_res["normalized_monthly"], "color": "#3b82f6", "share": 0},
        {"category": "Fuel", "emissions": fuel_res["normalized_monthly"], "color": "#ef4444", "share": 0},
        {"category": "Waste", "emissions": waste_res["normalized_monthly"], "color": "#10b981", "share": 0},
    ]

    if total_norm > 0:
        for b in breakdown:
            b["share"] = round((b["emissions"] / total_norm) * 100)

    return {
        "total_emissions": total_direct,
        "total_monthly_normalized": total_norm,
        "breakdown": breakdown,
        "details": {
            "electricity": elec_res,
            "transportation": trans_res,
            "fuel": fuel_res,
            "waste": waste_res
        }
    }
