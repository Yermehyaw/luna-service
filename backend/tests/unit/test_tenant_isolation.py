from unittest.mock import AsyncMock
import time
import jwt
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import settings
from app.core.database import get_db
from app.main import app


def create_token(role: str, tenant_id: str, email: str = "test@example.com") -> str:
    payload = {
        "sub": f"usr_{role}_{tenant_id}",
        "email": email,
        "role": role,
        "tenantId": tenant_id,
        "privileges": ["ops_console", "social_studio", "manage_services"],
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm="HS256")


@pytest.fixture
def mock_db():
    session = AsyncMock()
    async def _get_db():
        yield session
    app.dependency_overrides[get_db] = _get_db
    yield session
    app.dependency_overrides.pop(get_db, None)


@pytest.mark.asyncio
async def test_tenant_isolation_on_tickets_list(mock_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Mock list_tickets to return empty list
        mock_db.execute.return_value.scalars.return_value.all.return_value = []
        mock_db.execute.return_value.scalar.return_value = 0

        # 1. Accessing own tenant with matching token should not raise 403
        valid_token = create_token("tenant_admin", "kemis-lounge")
        response = await client.get(
            "/api/queue/tickets?business_id=kemis-lounge",
            headers={"Authorization": f"Bearer {valid_token}"},
        )
        assert response.status_code == 200

        # 2. Accessing another tenant's tickets must return 403 Forbidden
        other_tenant_token = create_token("tenant_admin", "other-salon")
        response = await client.get(
            "/api/queue/tickets?business_id=kemis-lounge",
            headers={"Authorization": f"Bearer {other_tenant_token}"},
        )
        assert response.status_code == 403
        data = response.json()
        assert "Multi-tenant isolation violation" in data["detail"]


@pytest.mark.asyncio
async def test_super_admin_bypasses_tenant_isolation(mock_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        mock_db.execute.return_value.scalars.return_value.all.return_value = []
        mock_db.execute.return_value.scalar.return_value = 0

        super_token = create_token("super_admin", "system", email="admin@luna.tech")
        response = await client.get(
            "/api/queue/tickets?business_id=kemis-lounge",
            headers={"Authorization": f"Bearer {super_token}"},
        )
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_customer_forbidden_from_staff_ticket_transition(mock_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Customer trying to transition ticket status
        customer_token = create_token("customer", "kemis-lounge")
        response = await client.patch(
            "/api/queue/tickets/KL-001/status?business_id=kemis-lounge",
            json={"status": "called"},
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert response.status_code == 403
        assert "Staff privileges required" in response.json()["detail"]


@pytest.mark.asyncio
async def test_social_studio_tenant_isolation(mock_db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Other tenant cannot read social accounts
        other_tenant_token = create_token("tenant_admin", "other-salon")
        res_accounts = await client.get(
            "/api/social/accounts?business_id=kemis-lounge",
            headers={"Authorization": f"Bearer {other_tenant_token}"},
        )
        assert res_accounts.status_code == 403
        assert "Multi-tenant isolation violation" in res_accounts.json()["detail"]

        # 2. Other tenant cannot read social inbox conversations
        res_convos = await client.get(
            "/api/social/conversations?business_id=kemis-lounge",
            headers={"Authorization": f"Bearer {other_tenant_token}"},
        )
        assert res_convos.status_code == 403
        assert "Multi-tenant isolation violation" in res_convos.json()["detail"]

        # 3. Customer cannot reply to social messages
        customer_token = create_token("customer", "kemis-lounge")
        res_reply = await client.post(
            "/api/social/reply",
            json={
                "business_id": "kemis-lounge",
                "message_id": "msg_001",
                "reply_text": "Thank you for visiting!",
            },
            headers={"Authorization": f"Bearer {customer_token}"},
        )
        assert res_reply.status_code == 403
        assert "Staff privileges required" in res_reply.json()["detail"]
