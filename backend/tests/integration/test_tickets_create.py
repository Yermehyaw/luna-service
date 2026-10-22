import re

TICKET_NUMBER_PATTERN = re.compile(r"^AC-[A-Z0-9]{5}$")


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


async def test_creating_a_ticket_persists_it(client, tenant):
    response = await client.post("/api/queue/tickets", json=_payload(tenant))

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "booked"
    assert body["customer_name"] == "Ada Lovelace"
    assert body["id"]


async def test_created_ticket_uses_the_business_prefix(client, tenant):
    body = (await client.post("/api/queue/tickets", json=_payload(tenant))).json()

    assert TICKET_NUMBER_PATTERN.match(body["ticket_number"])


async def test_ticket_numbers_are_unique_across_many_bookings(client, tenant):
    numbers = set()
    for index in range(12):
        response = await client.post(
            "/api/queue/tickets",
            json=_payload(tenant, customer_name=f"Customer {index}"),
        )
        assert response.status_code == 201
        numbers.add(response.json()["ticket_number"])

    assert len(numbers) == 12


async def test_created_ticket_is_fetchable_by_its_number(client, tenant):
    created = (await client.post("/api/queue/tickets", json=_payload(tenant))).json()

    response = await client.get(
        f"/api/queue/tickets/{created['ticket_number']}",
        params={"business_id": tenant["business_id"]},
    )

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


async def test_create_returns_a_wait_estimate(client, tenant):
    body = (await client.post("/api/queue/tickets", json=_payload(tenant))).json()

    assert body["wait"] is not None
    assert body["wait"]["tickets_ahead"] == 0
    assert body["wait"]["minutes"] == 0
    assert body["wait"]["display"] == "Any moment now"


async def test_booking_an_inactive_service_is_rejected(client, tenant):
    response = await client.post(
        "/api/queue/tickets",
        json=_payload(tenant, service_id=tenant["inactive_service_id"]),
    )

    assert response.status_code == 409


async def test_booking_a_service_from_another_business_is_rejected(
    client, tenant, other_tenant
):
    response = await client.post(
        "/api/queue/tickets", json=_payload(tenant, service_id=other_tenant["service_id"])
    )

    assert response.status_code == 404


async def test_booking_a_branch_from_another_business_is_rejected(
    client, tenant, other_tenant
):
    response = await client.post(
        "/api/queue/tickets", json=_payload(tenant, branch_id=other_tenant["branch_id"])
    )

    assert response.status_code == 404


async def test_creating_a_ticket_requires_a_customer_name(client, tenant):
    response = await client.post(
        "/api/queue/tickets", json=_payload(tenant, customer_name="   ")
    )

    assert response.status_code == 422


async def test_ticket_numbers_are_not_sequential(client, tenant):
    numbers = []
    for index in range(10):
        response = await client.post(
            "/api/queue/tickets",
            json=_payload(tenant, customer_name=f"Customer {index}"),
        )
        numbers.append(response.json()["ticket_number"])

    assert numbers != sorted(numbers)
