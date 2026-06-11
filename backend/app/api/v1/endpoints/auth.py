from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.deps import CurrentAdmin, require_same_origin
from app.core.config import get_settings
from app.schemas.auth import LoginRequest, LoginResult, MeResponse
from app.services import auth_service

router = APIRouter()


def _cookie_kwargs() -> dict[str, Any]:
    """Shared cookie attributes so set and delete match exactly."""
    settings = get_settings()
    kwargs: dict[str, Any] = {
        "key": settings.cookie_name,
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
        "path": "/",
    }
    if settings.cookie_domain:
        kwargs["domain"] = settings.cookie_domain
    return kwargs


@router.post("/auth/login", response_model=LoginResult, summary="Admin login")
def login(payload: LoginRequest, response: Response) -> LoginResult:
    token = auth_service.authenticate_admin(payload.email, payload.password)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    settings = get_settings()
    response.set_cookie(
        value=token,
        max_age=settings.jwt_expire_minutes * 60,
        **_cookie_kwargs(),
    )
    return LoginResult()


@router.post(
    "/auth/logout",
    response_model=LoginResult,
    summary="Admin logout",
    dependencies=[Depends(require_same_origin)],
)
def logout(response: Response) -> LoginResult:
    # delete_cookie must use the same attributes the cookie was set with.
    response.delete_cookie(**_cookie_kwargs())
    return LoginResult()


@router.get("/auth/me", response_model=MeResponse, summary="Current admin")
def me(admin: CurrentAdmin) -> MeResponse:
    return MeResponse(email=admin)
