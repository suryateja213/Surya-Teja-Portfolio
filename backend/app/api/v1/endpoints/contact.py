from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.api.deps import CurrentAdmin, require_same_origin
from app.schemas.common import Page
from app.schemas.contact import ContactCreate, ContactDetail, ContactRead, ContactResult
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


# ---- Admin ----


@router.get(
    "/contacts",
    response_model=Page[ContactRead],
    summary="List contact submissions (admin)",
)
def list_contacts(
    _admin: CurrentAdmin,
    limit: int = 25,
    cursor: str | None = None,
) -> Page[ContactRead]:
    limit = max(1, min(limit, 100))
    return contact_service.list_contacts_page(limit=limit, cursor=cursor)


@router.get(
    "/contacts/{contact_id}",
    response_model=ContactDetail,
    summary="Get a contact submission (admin)",
)
def get_contact(contact_id: str, _admin: CurrentAdmin) -> ContactDetail:
    contact = contact_service.get_contact(contact_id)
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return contact


@router.delete(
    "/contacts/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a contact submission (admin)",
    dependencies=[Depends(require_same_origin)],
)
def delete_contact(contact_id: str, _admin: CurrentAdmin) -> None:
    if not contact_service.delete_contact(contact_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
