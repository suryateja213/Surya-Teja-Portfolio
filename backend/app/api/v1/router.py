from fastapi import APIRouter

from app.api.v1.endpoints import (
    ask,
    auth,
    contact,
    events,
    health,
    metrics,
    projects,
    skill_graph,
    stats,
)

api_router = APIRouter(prefix="/v1")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(contact.router, tags=["contact"])
api_router.include_router(projects.router, tags=["projects"])
api_router.include_router(skill_graph.router, tags=["skill-graph"])
api_router.include_router(events.router, tags=["events"])
api_router.include_router(metrics.router, tags=["metrics"])
api_router.include_router(ask.router, tags=["ask"])
api_router.include_router(stats.router, tags=["stats"])
api_router.include_router(auth.router, tags=["auth"])
