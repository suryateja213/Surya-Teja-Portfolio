from pydantic import BaseModel, EmailStr, Field

# Mirrors the frontend Zod contact schema (frontend/src/lib/contact-schema.ts).


class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(min_length=10, max_length=2000)
    # Honeypot: real users leave this empty; bots fill it. Accepted by the
    # schema (no constraint) but dropped silently in the endpoint, so a bot
    # sees a normal success rather than a validation hint.
    company: str | None = None


class ContactRead(BaseModel):
    id: str
    name: str
    email: EmailStr
    message: str
    created_at: str


class ContactDetail(ContactRead):
    """Full submission incl. request metadata — admin detail view only."""

    ip: str | None = None
    user_agent: str | None = None


class ContactResult(BaseModel):
    status: str = "success"
    message: str = "Thanks — I'll be in touch."
