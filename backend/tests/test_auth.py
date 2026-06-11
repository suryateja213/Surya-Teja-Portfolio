from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD


def test_login_sets_cookie(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post(
        "/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
    # The JWT travels in an httpOnly cookie, not the body.
    assert "access_token" not in resp.json()
    assert "admin_session" in resp.cookies


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


def test_me_requires_auth(client) -> None:  # type: ignore[no-untyped-def]
    assert client.get("/v1/auth/me").status_code == 401


def test_me_returns_admin_after_login(admin_client) -> None:  # type: ignore[no-untyped-def]
    resp = admin_client.get("/v1/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == ADMIN_EMAIL


def test_logout_clears_session(admin_client) -> None:  # type: ignore[no-untyped-def]
    assert admin_client.get("/v1/auth/me").status_code == 200
    out = admin_client.post("/v1/auth/logout")
    assert out.status_code == 200
    # Cookie cleared → session no longer valid.
    assert admin_client.get("/v1/auth/me").status_code == 401
