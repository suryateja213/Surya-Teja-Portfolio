from fastapi import APIRouter

from app.api.v1.endpoints import auth, contact, health, projects

api_router = APIRouter(prefix="/v1")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(contact.router, tags=["contact"])
api_router.include_router(projects.router, tags=["projects"])
api_router.include_router(auth.router, tags=["auth"])
