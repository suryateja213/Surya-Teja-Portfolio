"""Shared API dependencies."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token

_bearer = HTTPBearer(auto_error=True)


def get_current_admin(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
) -> str:
    """Validate the bearer JWT and return the admin subject, else 401."""
    subject = decode_access_token(credentials.credentials)
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return subject


CurrentAdmin = Annotated[str, Depends(get_current_admin)]
