VALID = {
    "name": "Jane Recruiter",
    "email": "jane@example.com",
    "message": "I'd love to talk about a backend role on our platform team.",
}


def test_contact_submit_succeeds(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post("/v1/contact", json=VALID)
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"


def test_contact_validation_rejects_short_message(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post("/v1/contact", json={**VALID, "message": "too short"})
    assert resp.status_code == 422


def test_contact_rejects_bad_email(client) -> None:  # type: ignore[no-untyped-def]
    resp = client.post("/v1/contact", json={**VALID, "email": "not-an-email"})
    assert resp.status_code == 422


def test_contact_honeypot_drops_silently(client) -> None:  # type: ignore[no-untyped-def]
    # A filled honeypot looks like success to the bot but is never stored.
    resp = client.post("/v1/contact", json={**VALID, "company": "spam-co"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"
