import os
from collections.abc import Iterator

import boto3
import pytest
from app.core.security import hash_password
from moto import mock_aws

TABLE_NAME = "test-portfolio"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "correct horse battery staple"


@pytest.fixture(autouse=True)
def _env() -> Iterator[None]:
    """Set env and reset cached singletons before each test."""
    os.environ["TABLE_NAME"] = TABLE_NAME
    os.environ["AWS_REGION"] = "us-east-1"
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["JWT_SECRET"] = "test-secret"
    os.environ["ADMIN_EMAIL"] = ADMIN_EMAIL
    os.environ["ADMIN_PASSWORD_HASH"] = hash_password(ADMIN_PASSWORD)
    os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000"
    os.environ.pop("DYNAMODB_ENDPOINT_URL", None)

    from app.core.config import get_settings
    from app.db.dynamodb import get_table

    get_settings.cache_clear()
    get_table.cache_clear()
    yield
    get_settings.cache_clear()
    get_table.cache_clear()


@pytest.fixture
def dynamodb_table() -> Iterator[None]:
    """Create the single table (with GSI1) in a moto-mocked DynamoDB."""
    with mock_aws():
        client = boto3.client("dynamodb", region_name="us-east-1")
        client.create_table(
            TableName=TABLE_NAME,
            BillingMode="PAY_PER_REQUEST",
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "GSI1PK", "AttributeType": "S"},
                {"AttributeName": "GSI1SK", "AttributeType": "S"},
            ],
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "GSI1",
                    "KeySchema": [
                        {"AttributeName": "GSI1PK", "KeyType": "HASH"},
                        {"AttributeName": "GSI1SK", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                }
            ],
        )
        yield


@pytest.fixture
def client(dynamodb_table: None) -> Iterator["object"]:
    """A TestClient bound to the app with the mocked table available."""
    from app.main import app
    from fastapi.testclient import TestClient

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin_token(client: "object") -> str:
    resp = client.post(  # type: ignore[attr-defined]
        "/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert resp.status_code == 200
    return str(resp.json()["access_token"])
