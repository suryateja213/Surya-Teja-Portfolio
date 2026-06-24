from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, read from environment variables (or a local .env).

    In production these come from Lambda environment variables set by Terraform.
    Secrets are never committed — see backend/.env.example for the contract.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # DynamoDB
    table_name: str = "surya-portfolio"
    aws_region: str = "us-east-1"
    # Local-only override to target DynamoDB Local / moto. Empty in production.
    dynamodb_endpoint_url: str | None = None

    # Auth / JWT
    jwt_secret: str = "change-me-in-production"
    jwt_expire_minutes: int = 60
    jwt_algorithm: str = "HS256"
    admin_email: str = "admin@example.com"
    admin_password_hash: str = ""

    # Session cookie (admin JWT delivered as an httpOnly cookie).
    # Cross-subdomain in prod: domain ".kommugurisuryateja.com" so the apex-hosted
    # dashboard sends it to the api. subdomain; SameSite=None requires Secure.
    # Local dev omits the domain and uses Lax (Domain=localhost is rejected).
    cookie_name: str = "admin_session"
    cookie_domain: str | None = None
    cookie_secure: bool = True
    cookie_samesite: str = "none"

    # Ask Surya AI (RAG over portfolio content via Anthropic Claude).
    # The key is set in Lambda env in prod; empty locally means the /ask endpoint
    # reports "unavailable" instead of calling out.
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-haiku-4-5"
    # Hard daily ceiling on AI questions answered, enforced via a DynamoDB
    # counter — caps Anthropic spend regardless of traffic.
    ai_daily_cap: int = 200

    # CORS — comma-separated origins in the env var, parsed to a list.
    # NoDecode disables pydantic-settings' JSON pre-parse so the validator below
    # can split the plain comma-separated string.
    allowed_origins: Annotated[list[str], NoDecode] = ["http://localhost:3000"]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton (reused across warm Lambda invocations)."""
    return Settings()
