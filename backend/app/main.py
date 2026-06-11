from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging

configure_logging()
settings = get_settings()

app = FastAPI(
    title="Surya Teja — Portfolio API",
    version="0.1.0",
    description="Contact intake, project content, and single-admin auth.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    # With credentials, the CORS spec forbids "*" for headers — list explicitly.
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(api_router)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": "portfolio-api", "docs": "/docs"}


# AWS Lambda entry point (referenced by Terraform as `app.main.handler`).
handler = Mangum(app)
