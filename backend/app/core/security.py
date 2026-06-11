from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

# bcrypt operates on at most 72 bytes; longer inputs must be truncated by us.
_BCRYPT_MAX_BYTES = 72


def _encode(plain: str) -> bytes:
    return plain.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def verify_password(plain: str, hashed: str) -> bool:
    """Check a plaintext password against a bcrypt hash."""
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(_encode(plain), hashed.encode("utf-8"))
    except ValueError:
        # Malformed hash in config — treat as non-match rather than crashing.
        return False


def hash_password(plain: str) -> str:
    """Hash a plaintext password (used to generate ADMIN_PASSWORD_HASH)."""
    return bcrypt.hashpw(_encode(plain), bcrypt.gensalt()).decode("utf-8")


def create_access_token(subject: str) -> str:
    """Issue a short-lived JWT for the single admin subject."""
    settings = get_settings()
    now = datetime.now(UTC)
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return str(jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm))


def decode_access_token(token: str) -> str | None:
    """Return the token subject if valid, else None."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
    subject = payload.get("sub")
    return str(subject) if subject is not None else None
