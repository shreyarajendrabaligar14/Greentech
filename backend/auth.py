import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import get_db

# Read secrets from environment variables with sensible local fallback
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "carbontrack_super_secret_hackfest2026_jwt_signing_key_replace_in_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    """Hashes a password securely using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed, time-limited JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT token signature and expiration."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    """FastAPI dependency to retrieve the authenticated user from the bearer token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise credentials_exception

    user_id = payload.get("user_id") or payload.get("sub")
    with get_db() as conn:
        cursor = conn.cursor()
        if isinstance(user_id, int) or (isinstance(user_id, str) and user_id.isdigit()):
            row = cursor.execute("SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = ?", (int(user_id),)).fetchone()
        else:
            row = cursor.execute("SELECT id, email, full_name, role, is_active, created_at FROM users WHERE email = ?", (str(user_id).lower(),)).fetchone()

        if not row:
            raise credentials_exception

        user = dict(row)
        if not user.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Please contact an administrator."
            )
        return user

def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """FastAPI dependency enforcing administrator role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrator privileges required."
        )
    return current_user

def get_optional_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[dict]:
    """FastAPI dependency returning the user if authenticated, or None for guest requests."""
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("user_id") or payload.get("sub")
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            if isinstance(user_id, int) or (isinstance(user_id, str) and user_id.isdigit()):
                row = cursor.execute("SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = ?", (int(user_id),)).fetchone()
            else:
                row = cursor.execute("SELECT id, email, full_name, role, is_active, created_at FROM users WHERE email = ?", (str(user_id).lower(),)).fetchone()
            return dict(row) if row and row["is_active"] else None
    except Exception:
        return None
