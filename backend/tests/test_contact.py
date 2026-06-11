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


# ---- Admin contact endpoints ----


def test_list_contacts_requires_auth(client) -> None:  # type: ignore[no-untyped-def]
    assert client.get("/v1/contacts").status_code == 401


def test_list_contacts_paginated(admin_client) -> None:  # type: ignore[no-untyped-def]
    for i in range(3):
        admin_client.post("/v1/contact", json={**VALID, "name": f"Person {i}"})

    page = admin_client.get("/v1/contacts")
    assert page.status_code == 200
    body = page.json()
    assert len(body["items"]) == 3
    assert body["next_cursor"] is None  # all fit in the default page

    first = admin_client.get("/v1/contacts?limit=1")
    one = first.json()
    assert len(one["items"]) == 1
    assert one["next_cursor"] is not None
    # Cursor fetches the next page.
    nxt = admin_client.get(f"/v1/contacts?limit=1&cursor={one['next_cursor']}")
    assert len(nxt.json()["items"]) == 1
    assert nxt.json()["items"][0]["id"] != one["items"][0]["id"]


def test_get_and_delete_contact(admin_client) -> None:  # type: ignore[no-untyped-def]
    admin_client.post("/v1/contact", json=VALID)
    listed = admin_client.get("/v1/contacts").json()["items"]
    contact_id = listed[0]["id"]

    detail = admin_client.get(f"/v1/contacts/{contact_id}")
    assert detail.status_code == 200
    # Detail exposes request metadata captured at submit time.
    assert "ip" in detail.json()
    assert "user_agent" in detail.json()

    assert admin_client.delete(f"/v1/contacts/{contact_id}").status_code == 204
    assert admin_client.get(f"/v1/contacts/{contact_id}").status_code == 404


def test_get_missing_contact_404(admin_client) -> None:  # type: ignore[no-untyped-def]
    assert admin_client.get("/v1/contacts/nope").status_code == 404
