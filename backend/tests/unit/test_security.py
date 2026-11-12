import time
import jwt
import pytest
from fastapi import HTTPException

from app.core.config import settings
from app.core.security import (
    AuthenticatedUser,
    decode_jwt_token,
    enforce_tenant_isolation,
)


def test_authenticated_user_roles_and_privileges():
    # Staff with explicit privilege
    staff = AuthenticatedUser(
        id="usr_1",
        email="staff@kemislounge.com",
        role="staff",
        tenant_id="kemis-lounge",
        privileges=["ops_console"],
    )
    assert staff.is_staff is True
    assert staff.is_tenant_admin is False
    assert staff.is_super_admin is False
    assert staff.has_privilege("ops_console") is True
    assert staff.has_privilege("manage_services") is False

    # Tenant admin has all privileges
    owner = AuthenticatedUser(
        id="usr_2",
        email="owner@kemislounge.com",
        role="tenant_admin",
        tenant_id="kemis-lounge",
    )
    assert owner.is_staff is True
    assert owner.is_tenant_admin is True
    assert owner.has_privilege("anything") is True

    # Customer
    customer = AuthenticatedUser(
        id="usr_3",
        email="customer@example.com",
        role="customer",
        tenant_id="kemis-lounge",
    )
    assert customer.is_staff is False
    assert customer.is_tenant_admin is False
    assert customer.has_privilege("ops_console") is False


def test_decode_valid_jwt():
    payload = {
        "sub": "usr_abc123",
        "email": "kemi@kemislounge.com",
        "role": "tenant_admin",
        "tenantId": "kemis-lounge",
        "privileges": ["ops_console", "social_studio"],
        "exp": int(time.time()) + 3600,
    }
    token = jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm="HS256")

    decoded = decode_jwt_token(token)
    assert decoded["sub"] == "usr_abc123"
    assert decoded["email"] == "kemi@kemislounge.com"
    assert decoded["role"] == "tenant_admin"
    assert decoded["tenantId"] == "kemis-lounge"


def test_decode_expired_jwt():
    payload = {
        "sub": "usr_abc123",
        "email": "kemi@kemislounge.com",
        "exp": int(time.time()) - 3600,  # Expired 1 hour ago
    }
    token = jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm="HS256")

    with pytest.raises(HTTPException) as exc_info:
        decode_jwt_token(token)
    assert exc_info.value.status_code == 401
    assert "expired" in str(exc_info.value.detail).lower()


def test_decode_invalid_signature():
    payload = {
        "sub": "usr_abc123",
        "email": "kemi@kemislounge.com",
        "exp": int(time.time()) + 3600,
    }
    # Signed with wrong secret (>=32 bytes)
    token = jwt.encode(payload, "wrong_secret_key_that_is_32_bytes_long!!", algorithm="HS256")

    with pytest.raises(HTTPException) as exc_info:
        decode_jwt_token(token)
    assert exc_info.value.status_code == 401


def test_decode_test_token():
    decoded = decode_jwt_token("test_token_tenant_admin_kemis-lounge")
    assert decoded["role"] == "tenant_admin"
    assert decoded["tenantId"] == "kemis-lounge"


def test_enforce_tenant_isolation():
    user = AuthenticatedUser(
        id="usr_1",
        email="kemi@kemislounge.com",
        role="tenant_admin",
        tenant_id="kemis-lounge",
    )

    # Accessing own tenant is allowed
    enforce_tenant_isolation("kemis-lounge", user)

    # Accessing another tenant raises 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        enforce_tenant_isolation("other-salon", user)
    assert exc_info.value.status_code == 403
    assert "isolation violation" in str(exc_info.value.detail).lower()

    # Super admin can access any tenant
    super_admin = AuthenticatedUser(
        id="usr_root",
        email="root@luna.tech",
        role="super_admin",
        tenant_id="system",
    )
    enforce_tenant_isolation("other-salon", super_admin)
