PROJECT = {
    "slug": "telemetry-streaming-pipeline",
    "title": "Telemetry Streaming Pipeline",
    "summary": "Event-driven ingestion that stays fast under load.",
    "stack": ["Python", "Kafka", "DynamoDB"],
    "featured": True,
    "order": 1,
}


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_list_projects_empty(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.get("/v1/projects")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_requires_auth(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post("/v1/projects", json=PROJECT)
    assert resp.status_code == 403  # no bearer credentials


def test_create_then_get_and_list(client, admin_token) -> None:  # type: ignore[no-untyped-def]
    created = client.post("/v1/projects", json=PROJECT, headers=_auth(admin_token))
    assert created.status_code == 201
    assert created.json()["slug"] == PROJECT["slug"]

    got = client.get(f"/v1/projects/{PROJECT['slug']}")
    assert got.status_code == 200
    assert got.json()["title"] == PROJECT["title"]

    listed = client.get("/v1/projects")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_duplicate_slug_conflicts(client, admin_token) -> None:  # type: ignore[no-untyped-def]
    client.post("/v1/projects", json=PROJECT, headers=_auth(admin_token))
    dup = client.post("/v1/projects", json=PROJECT, headers=_auth(admin_token))
    assert dup.status_code == 409


def test_get_missing_returns_404(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.get("/v1/projects/does-not-exist")
    assert resp.status_code == 404


def test_update_and_delete(client, admin_token) -> None:  # type: ignore[no-untyped-def]
    client.post("/v1/projects", json=PROJECT, headers=_auth(admin_token))

    updated = client.put(
        f"/v1/projects/{PROJECT['slug']}",
        json={"summary": "Reworked summary."},
        headers=_auth(admin_token),
    )
    assert updated.status_code == 200
    assert updated.json()["summary"] == "Reworked summary."

    deleted = client.delete(f"/v1/projects/{PROJECT['slug']}", headers=_auth(admin_token))
    assert deleted.status_code == 204

    assert client.get(f"/v1/projects/{PROJECT['slug']}").status_code == 404
