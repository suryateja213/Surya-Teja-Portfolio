def test_health_ok(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.get("/v1/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
