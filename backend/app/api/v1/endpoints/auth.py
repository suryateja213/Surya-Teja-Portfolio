from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import LoginRequest, TokenResponse
from app.services import auth_service

router = APIRouter()


@router.post("/auth/login", response_model=TokenResponse, summary="Admin login")
def login(payload: LoginRequest) -> TokenResponse:
    token = auth_service.authenticate_admin(payload.email, payload.password)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return TokenResponse(access_token=token)
