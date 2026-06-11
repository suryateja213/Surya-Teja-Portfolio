PROJECT = {
    "slug": "telemetry-streaming-pipeline",
    "title": "Telemetry Streaming Pipeline",
    "summary": "Event-driven ingestion that stays fast under load.",
    "stack": ["Python", "Kafka", "DynamoDB"],
    "featured": True,
    "order": 1,
}


def test_list_projects_empty(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.get("/v1/projects")
    assert resp.status_code == 200
    assert resp.json() == []


def test_create_requires_auth(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post("/v1/projects", json=PROJECT)
    assert resp.status_code == 401  # no session cookie


def test_create_then_get_and_list(admin_client) -> None:  # type: ignore[no-untyped-def]
    created = admin_client.post("/v1/projects", json=PROJECT)
    assert created.status_code == 201
    assert created.json()["slug"] == PROJECT["slug"]

    got = admin_client.get(f"/v1/projects/{PROJECT['slug']}")
    assert got.status_code == 200
    assert got.json()["title"] == PROJECT["title"]

    listed = admin_client.get("/v1/projects")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_duplicate_slug_conflicts(admin_client) -> None:  # type: ignore[no-untyped-def]
    admin_client.post("/v1/projects", json=PROJECT)
    dup = admin_client.post("/v1/projects", json=PROJECT)
    assert dup.status_code == 409


def test_get_missing_returns_404(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.get("/v1/projects/does-not-exist")
    assert resp.status_code == 404


def test_update_and_delete(admin_client) -> None:  # type: ignore[no-untyped-def]
    admin_client.post("/v1/projects", json=PROJECT)

    updated = admin_client.put(
        f"/v1/projects/{PROJECT['slug']}",
        json={"summary": "Reworked summary."},
    )
    assert updated.status_code == 200
    assert updated.json()["summary"] == "Reworked summary."

    deleted = admin_client.delete(f"/v1/projects/{PROJECT['slug']}")
    assert deleted.status_code == 204

    assert admin_client.get(f"/v1/projects/{PROJECT['slug']}").status_code == 404


def test_mutation_rejected_without_origin(admin_client) -> None:  # type: ignore[no-untyped-def]
    # Authenticated but cross-origin (no allowed Origin) → CSRF guard 403.
    resp = admin_client.post(
        "/v1/projects", json=PROJECT, headers={"Origin": "https://evil.example"}
    )
    assert resp.status_code == 403
