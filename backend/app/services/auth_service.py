"""Single-admin authentication."""

from app.core.config import get_settings
from app.core.security import create_access_token, verify_password


def authenticate_admin(email: str, password: str) -> str | None:
    """Verify admin credentials; return a JWT on success, else None."""
    settings = get_settings()
    if email.lower() != settings.admin_email.lower():
        return None
    if not verify_password(password, settings.admin_password_hash):
        return None
    return create_access_token(subject=settings.admin_email)
