def _payload(tenant, **overrides):
    body = {
        "business_id": tenant["business_id"],
        "branch_id": tenant["branch_id"],
        "service_id": tenant["service_id"],
        "customer_id": tenant["customer_id"],
        "customer_name": "Ada Lovelace",
        "customer_email": "ada@example.com",
    }
    body.update(overrides)
    return body


async def _book(client, tenant, **overrides):
    response = await client.post("/api/queue/tickets", json=_payload(tenant, **overrides))
    assert response.status_code == 201, response.text
    return response.json()["ticket_number"]


async def test_listing_tickets_is_scoped_to_the_business(client, tenant, other_tenant):
    mine = await _book(client, tenant)
    theirs = await _book(client, other_tenant)

    response = await client.get(
        "/api/queue/tickets", params={"business_id": tenant["business_id"]}
    )

    assert response.status_code == 200
    numbers = [item["ticket_number"] for item in response.json()["items"]]
    assert mine in numbers
    assert theirs not in numbers


async def test_one_tenant_cannot_read_another_tenants_ticket(
    client, tenant, other_tenant
):
    theirs = await _book(client, other_tenant)

    response = await client.get(
        f"/api/queue/tickets/{theirs}",
        params={"business_id": tenant["business_id"]},
    )

    # 404 rather than 403, so the response doesn't confirm the ticket exists.
    assert response.status_code == 404


async def test_one_tenant_cannot_transition_another_tenants_ticket(
    client, tenant, other_tenant
):
    theirs = await _book(client, other_tenant)

    response = await client.patch(
        f"/api/queue/tickets/{theirs}/status",
        params={"business_id": tenant["business_id"]},
        json={"status": "called"},
    )

    assert response.status_code == 404


async def test_filters_narrow_the_listing(client, tenant):
    await _book(client, tenant, customer_name="First")
    second = await _book(client, tenant, customer_name="Second")

    by_service = await client.get(
        "/api/queue/tickets",
        params={"business_id": tenant["business_id"], "service_id": tenant["service_id"]},
    )
    assert second in [item["ticket_number"] for item in by_service.json()["items"]]

    empty = await client.get(
        "/api/queue/tickets",
        params={"business_id": tenant["business_id"], "service_id": "does-not-exist"},
    )
    assert empty.json()["items"] == []


async def test_pagination_reports_the_full_total(client, tenant):
    for index in range(5):
        await _book(client, tenant, customer_name=f"Customer {index}")

    response = await client.get(
        "/api/queue/tickets",
        params={"business_id": tenant["business_id"], "limit": 2, "offset": 0},
    )

    body = response.json()
    assert len(body["items"]) == 2
    assert body["total"] == 5
    assert body["limit"] == 2
    assert body["offset"] == 0


async def test_pagination_rejects_an_absurd_limit(client, tenant):
    response = await client.get(
        "/api/queue/tickets",
        params={"business_id": tenant["business_id"], "limit": 100000},
    )

    assert response.status_code == 422


async def test_active_only_hides_finished_tickets(client, tenant):
    finished = await _book(client, tenant)
    await client.patch(
        f"/api/queue/tickets/{finished}/status",
        params={"business_id": tenant["business_id"]},
        json={"status": "cancelled"},
    )
    await _book(client, tenant)

    response = await client.get(
        "/api/queue/tickets",
        params={"business_id": tenant["business_id"], "active_only": True},
    )

    numbers = [item["ticket_number"] for item in response.json()["items"]]
    assert finished not in numbers


async def test_wait_estimate_grows_with_the_queue(client, tenant):
    for index in range(3):
        await _book(client, tenant, customer_name=f"Customer {index}")
    last = await _book(client, tenant)

    response = await client.get(
        f"/api/queue/tickets/{last}/wait",
        params={"business_id": tenant["business_id"]},
    )

    body = response.json()
    assert body["tickets_ahead"] == 3
    # The seeded service runs 15 minutes each.
    assert body["minutes"] == 45
    assert body["display"] == "About 45 min"


async def test_wait_estimate_for_a_finished_ticket_is_zero(client, tenant):
    number = await _book(client, tenant)
    await client.patch(
        f"/api/queue/tickets/{number}/status",
        params={"business_id": tenant["business_id"]},
        json={"status": "cancelled"},
    )

    response = await client.get(
        f"/api/queue/tickets/{number}/wait",
        params={"business_id": tenant["business_id"]},
    )

    assert response.json()["minutes"] == 0
