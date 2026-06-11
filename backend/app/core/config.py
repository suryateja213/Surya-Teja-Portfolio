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
