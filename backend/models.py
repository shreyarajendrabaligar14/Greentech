from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any

# ==================== User & Authentication Models ====================

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    role: Optional[str] = "user"  # 'user' or 'admin'

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str  # 'user' or 'admin'
    is_active: bool = True
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    status: str = "received"
    instructions: str

# ==================== Admin Models ====================

class AdminUserListItem(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: str
    activities_count: int = 0
    total_emissions: float = 0.0

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    admin_count: int
    total_activities_logged: int
    system_total_co2e: float
    average_user_co2e: float

class UserStatusUpdateRequest(BaseModel):
    is_active: bool

# ==================== EcoBot Chatbot Models ====================

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)

class ChatMessageResponse(BaseModel):
    reply: str
    timestamp: str
    suggestions: List[str] = []
    personalized_used: bool = False

class ChatHistoryItem(BaseModel):
    id: int
    role: str  # 'user' or 'assistant'
    message: str
    created_at: str
    suggestions: Optional[List[str]] = None

# ==================== Carbon Accounting & Activity Models ====================

class ActivityBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    date: str
    total_emissions: float = Field(..., ge=0)
    electricity_emissions: float = Field(default=0.0, ge=0)
    transportation_emissions: float = Field(default=0.0, ge=0)
    fuel_emissions: float = Field(default=0.0, ge=0)
    waste_emissions: float = Field(default=0.0, ge=0)
    details: Optional[Dict[str, Any]] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int
    created_at: Optional[str] = None
    user_id: Optional[int] = None

class ElectricityInput(BaseModel):
    kwh: float = Field(..., ge=0)
    period: str = "monthly"
    custom_factor: Optional[float] = None

class TransportInput(BaseModel):
    km: float = Field(..., ge=0)
    mode: str = "car_petrol"
    frequency: str = "weekly"
    custom_factor: Optional[float] = None

class FuelInput(BaseModel):
    litres: float = Field(..., ge=0)
    fuel_type: str = "petrol"
    period: str = "monthly"
    custom_factor: Optional[float] = None

class WasteInput(BaseModel):
    kg: float = Field(..., ge=0)
    waste_type: str = "mixed"
    period: str = "monthly"
    custom_factor: Optional[float] = None

class CalculationRequest(BaseModel):
    electricity: Optional[ElectricityInput] = None
    transportation: Optional[TransportInput] = None
    fuel: Optional[FuelInput] = None
    waste: Optional[WasteInput] = None

class CategoryBreakdownItem(BaseModel):
    category: str
    emissions: float
    color: str
    share: int

class CalculationResponse(BaseModel):
    total_emissions: float
    total_monthly_normalized: float
    breakdown: List[CategoryBreakdownItem]
    details: Dict[str, Any]

class MonthlyTrendItem(BaseModel):
    month: str
    emissions: float

class DashboardSummaryResponse(BaseModel):
    total_emissions: float
    electricity_emissions: float
    transportation_emissions: float
    fuel_emissions: float
    waste_emissions: float
    activity_count: int
    change_pct: Optional[float] = None
    monthly_trends: List[MonthlyTrendItem]

class TargetModel(BaseModel):
    reduction_percentage: float = Field(..., ge=1, le=100)
    target_year: str = "2026"
    baseline_emissions: float = Field(default=0.0, ge=0)

class ChallengeItem(BaseModel):
    id: int
    title: str
    description: str
    category: str
    duration: str
    impact: str
    points: int
    completed: bool

class ChallengeToggleRequest(BaseModel):
    completed: bool

class LeaderboardItem(BaseModel):
    id: int
    rank: int
    name: str
    type: str
    location: str
    members: int
    per_capita_emissions: float
    reduction_pct: int
    sustainability_score: int
    badge: str
    is_sample: bool = True
