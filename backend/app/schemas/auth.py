from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResult(BaseModel):
    """Login response body. The JWT travels in an httpOnly cookie, not here."""

    status: str = "ok"


class MeResponse(BaseModel):
    """Current admin identity, derived from the session cookie."""

    email: str
