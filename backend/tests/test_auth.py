from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD


def test_login_succeeds(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post(
        "/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_rejects_wrong_password(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post(
        "/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": "wrong"},
    )
    assert resp.status_code == 401


def test_login_rejects_unknown_email(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post(
        "/v1/auth/login",
        json={"email": "stranger@example.com", "password": ADMIN_PASSWORD},
    )
    assert resp.status_code == 401
