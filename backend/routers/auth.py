from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_current_admin
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest):
    """Register a new user account."""
    email = data.email.strip().lower()
    full_name = data.full_name.strip()

    if not email or "@" not in email or "." not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address."
        )

    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required."
        )

    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    with get_db() as conn:
        cursor = conn.cursor()
        existing = cursor.execute(
            "SELECT id FROM users WHERE email = ?", (email,)
        ).fetchone()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists."
            )

        hashed_pw = hash_password(data.password)
        cursor.execute(
            "INSERT INTO users (email, full_name, hashed_password, role, is_active) VALUES (?, ?, ?, 'user', 1)",
            (email, full_name, hashed_pw)
        )
        user_id = cursor.lastrowid

    token = create_access_token({"sub": email, "user_id": user_id, "role": "user"})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={"id": user_id, "email": email, "full_name": full_name, "role": "user"}
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: Request):
    """Authenticate user with email + password (accepts both JSON and form-encoded data) and return JWT."""
    email = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")
    else:
        try:
            body = await request.json()
            if isinstance(body, dict):
                email = body.get("email") or body.get("username")
                password = body.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required."
        )

    email = str(email).strip().lower()
    password = str(password)

    with get_db() as conn:
        cursor = conn.cursor()
        row = cursor.execute(
            "SELECT id, email, full_name, hashed_password, role, is_active FROM users WHERE email = ?",
            (email,)
        ).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user = dict(row)
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact an administrator."
        )

    if not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({
        "sub": email,
        "user_id": user["id"],
        "role": user["role"]
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"]
        }
    )


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "role": current_user["role"],
        "created_at": current_user.get("created_at")
    }


# ---- Admin-only endpoints ----

@router.get("/admin/users")
def list_users(admin: dict = Depends(get_current_admin)):
    """List all user accounts (admin only)."""
    with get_db() as conn:
        cursor = conn.cursor()
        rows = cursor.execute(
            "SELECT id, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]


@router.post("/admin/users/{user_id}/toggle")
def toggle_user(user_id: int, admin: dict = Depends(get_current_admin)):
    """Activate or deactivate a user account (admin only)."""
    if user_id == admin["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own admin account."
        )
    with get_db() as conn:
        cursor = conn.cursor()
        row = cursor.execute("SELECT is_active FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found.")
        new_status = 0 if row["is_active"] else 1
        cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (new_status, user_id))
    return {"message": "User status updated.", "user_id": user_id, "is_active": bool(new_status)}


@router.delete("/admin/users/{user_id}")
def delete_user(user_id: int, admin: dict = Depends(get_current_admin)):
    """Delete a user account permanently (admin only)."""
    if user_id == admin["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account."
        )
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User deleted successfully.", "user_id": user_id}


@router.get("/admin/stats")
def admin_stats(admin: dict = Depends(get_current_admin)):
    """Return aggregated platform stats for the admin dashboard."""
    with get_db() as conn:
        cursor = conn.cursor()
        total_users = cursor.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'user'").fetchone()["cnt"]
        total_activities = cursor.execute("SELECT COUNT(*) as cnt FROM activities").fetchone()["cnt"]
        total_emissions = cursor.execute("SELECT COALESCE(SUM(total_emissions), 0) as total FROM activities").fetchone()["total"]
        active_challenges = cursor.execute("SELECT COUNT(*) as cnt FROM challenges WHERE completed = 1").fetchone()["cnt"]
        recent_users = cursor.execute(
            "SELECT id, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 5"
        ).fetchall()
        return {
            "total_users": total_users,
            "total_activities": total_activities,
            "total_emissions_kg": round(total_emissions, 2),
            "completed_challenges": active_challenges,
            "recent_users": [dict(r) for r in recent_users]
        }
