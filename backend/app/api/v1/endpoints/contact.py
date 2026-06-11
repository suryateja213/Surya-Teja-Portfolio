from fastapi import APIRouter, Request

from app.schemas.contact import ContactCreate, ContactResult
from app.services import contact_service

router = APIRouter()


@router.post("/contact", response_model=ContactResult, summary="Submit the contact form")
def create_contact(payload: ContactCreate, request: Request) -> ContactResult:
    """Public endpoint the static frontend POSTs to.

    Pydantic enforces the same constraints as the frontend Zod schema. The
    honeypot (`company`) is dropped silently — a tripped honeypot looks like
    success to the bot but is never stored.
    """
    if payload.company:
        return ContactResult()

    contact_service.submit_contact(
        payload,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return ContactResult()
