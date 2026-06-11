"""Shared API dependencies."""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from app.core.config import get_settings
from app.core.security import decode_access_token


def get_current_admin(request: Request) -> str:
    """Authenticate the admin from the session cookie, falling back to a Bearer token.

    The browser dashboard uses the httpOnly `admin_session` cookie (no token in JS).
    The Bearer fallback keeps pytest and the /docs "Authorize" button working.
    """
    settings = get_settings()
    token = request.cookies.get(settings.cookie_name)

    if token is None:
        auth = request.headers.get("Authorization", "")
        if auth.lower().startswith("bearer "):
            token = auth[7:].strip()

    subject = decode_access_token(token) if token else None
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return subject


def require_same_origin(request: Request) -> None:
    """CSRF guard for mutating requests.

    Because the session cookie is SameSite=None (it must ride cross-subdomain to
    the api. host), SameSite alone can't stop CSRF. Require the Origin (or Referer)
    to be an allowed origin. Cheap and sufficient for a single-admin tool.
    """
    settings = get_settings()
    origin = request.headers.get("origin")
    if origin is None:
        referer = request.headers.get("referer", "")
        # Reduce a Referer like https://host/path to its scheme://host origin.
        if referer:
            parts = referer.split("/")
            if len(parts) >= 3:
                origin = "/".join(parts[:3])

    if origin not in settings.allowed_origins:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cross-origin request rejected",
        )


CurrentAdmin = Annotated[str, Depends(get_current_admin)]
