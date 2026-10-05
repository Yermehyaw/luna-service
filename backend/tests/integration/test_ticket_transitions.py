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


async def _set_status(client, tenant, number, status):
    return await client.patch(
        f"/api/queue/tickets/{number}/status",
        params={"business_id": tenant["business_id"]},
        json={"status": status},
    )


async def test_booking_to_called_is_allowed(client, tenant):
    number = await _book(client, tenant)

    response = await _set_status(client, tenant, number, "called")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "called"
    assert body["called_at"] is not None


async def test_called_to_done_records_the_completion_time(client, tenant):
    number = await _book(client, tenant)
    await _set_status(client, tenant, number, "called")

    response = await _set_status(client, tenant, number, "done")

    assert response.status_code == 200
    assert response.json()["completed_at"] is not None


async def test_cancelling_records_the_cancellation_time(client, tenant):
    number = await _book(client, tenant)

    response = await _set_status(client, tenant, number, "cancelled")

    assert response.status_code == 200
    assert response.json()["cancelled_at"] is not None


async def test_done_cannot_be_moved_back_to_called(client, tenant):
    number = await _book(client, tenant)
    await _set_status(client, tenant, number, "called")
    await _set_status(client, tenant, number, "done")

    response = await _set_status(client, tenant, number, "called")

    assert response.status_code == 409
    assert "cannot move a ticket" in response.json()["detail"]


async def test_booked_cannot_skip_straight_to_done(client, tenant):
    number = await _book(client, tenant)

    response = await _set_status(client, tenant, number, "done")

    assert response.status_code == 409


async def test_cancelled_ticket_cannot_be_reinstated(client, tenant):
    number = await _book(client, tenant)
    await _set_status(client, tenant, number, "cancelled")

    response = await _set_status(client, tenant, number, "booked")

    assert response.status_code == 409


async def test_an_unknown_status_is_rejected_by_validation(client, tenant):
    number = await _book(client, tenant)

    response = await _set_status(client, tenant, number, "teleported")

    assert response.status_code == 422


async def test_status_change_persists_across_requests(client, tenant):
    number = await _book(client, tenant)
    await _set_status(client, tenant, number, "called")

    response = await client.get(
        f"/api/queue/tickets/{number}",
        params={"business_id": tenant["business_id"]},
    )

    assert response.json()["status"] == "called"


async def test_transitioning_an_unknown_ticket_is_a_404(client, tenant):
    response = await _set_status(client, tenant, "AC-NOPE1", "called")

    assert response.status_code == 404
