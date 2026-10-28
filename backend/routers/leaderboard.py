from fastapi import APIRouter
from typing import List
from models import LeaderboardItem

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

SAMPLE_LEADERBOARD_ENTRIES = [
    {
        "id": 1,
        "rank": 1,
        "name": "GreenTech Institute of Technology",
        "type": "college",
        "location": "Bengaluru Campus",
        "members": 3400,
        "per_capita_emissions": 42.5,
        "reduction_pct": 28,
        "sustainability_score": 94,
        "badge": "Platinum Eco-Campus",
        "is_sample": True
    },
    {
        "id": 2,
        "rank": 2,
        "name": "EcoSphere Solutions Corp",
        "type": "organization",
        "location": "Cyber City Hub",
        "members": 450,
        "per_capita_emissions": 56.2,
        "reduction_pct": 24,
        "sustainability_score": 91,
        "badge": "Gold Verified",
        "is_sample": True
    },
    {
        "id": 3,
        "rank": 3,
        "name": "National College of Sciences",
        "type": "college",
        "location": "North Campus",
        "members": 5100,
        "per_capita_emissions": 61.8,
        "reduction_pct": 19,
        "sustainability_score": 88,
        "badge": "Silver Campus",
        "is_sample": True
    },
    {
        "id": 4,
        "rank": 4,
        "name": "Vertex Cloud & Data Systems",
        "type": "organization",
        "location": "Tech Park East",
        "members": 890,
        "per_capita_emissions": 74.0,
        "reduction_pct": 15,
        "sustainability_score": 84,
        "badge": "Certified Transition",
        "is_sample": True
    },
    {
        "id": 5,
        "rank": 5,
        "name": "Apex Polytechnic Institute",
        "type": "college",
        "location": "Central Campus",
        "members": 2200,
        "per_capita_emissions": 82.3,
        "reduction_pct": 11,
        "sustainability_score": 79,
        "badge": "Active Tracker",
        "is_sample": True
    }
]

@router.get("", response_model=List[LeaderboardItem])
def get_leaderboard():
    return [LeaderboardItem(**entry) for entry in SAMPLE_LEADERBOARD_ENTRIES]
