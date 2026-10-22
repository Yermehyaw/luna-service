from unittest.mock import patch

from httpx import AsyncClient


async def test_root_returns_welcome(client: AsyncClient):
    response = await client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Luna API"}


async def test_health_reports_healthy_when_database_is_up(client: AsyncClient):
    with patch("app.main.check_database", return_value=True):
        response = await client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["checks"]["database"] == "ok"


async def test_health_reports_degraded_when_database_is_down(client: AsyncClient):
    with patch("app.main.check_database", return_value=False):
        response = await client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "degraded"
    assert body["checks"]["database"] == "unreachable"


async def test_health_stays_up_when_the_check_itself_raises(client: AsyncClient):
    with patch("app.main.check_database", side_effect=ConnectionError):
        response = await client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "degraded"
    assert body["checks"]["database"] == "unreachable"
