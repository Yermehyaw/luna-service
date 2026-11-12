"""Authentication & security module for Luna backend.

Verifies signed JWT tokens issued by Better-Auth (Next.js) or demo bearer
credentials, enforcing multi-tenant isolation, role checks, and privilege gates.
"""

from typing import Annotated, Callable
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from app.core.config import settings

# HTTPBearer with auto_error=False to allow optional authentication dependencies
bearer_scheme = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    id: str
    email: str
    name: str | None = None
    role: str = Field(default="customer")  # super_admin, tenant_admin, staff, customer
    tenant_id: str = Field(default="")
    privileges: list[str] = Field(default_factory=list)

    @property
    def is_super_admin(self) -> bool:
        return self.role == "super_admin"

    @property
    def is_tenant_admin(self) -> bool:
        return self.role in ("super_admin", "tenant_admin")

    @property
    def is_staff(self) -> bool:
        return self.role in ("super_admin", "tenant_admin", "staff")

    def has_privilege(self, priv: str) -> bool:
        if self.is_tenant_admin:
            return True
        return priv in self.privileges


def decode_jwt_token(token: str) -> dict:
    """Decode and verify a Better-Auth signed JWT."""
    # Special handle demo / testing tokens
    if token.startswith("test_token_") or token.startswith("test_token:"):
        prefix = "test_token_" if token.startswith("test_token_") else "test_token:"
        rest = token[len(prefix):]
        if ":" in rest:
            role, tenant = rest.split(":", 1)
        elif "@" in rest:
            role, tenant = rest.split("@", 1)
        else:
            parts = rest.rsplit("_", 1)
            role = parts[0] if len(parts) > 0 else "staff"
            tenant = parts[1] if len(parts) > 1 else "kemis-lounge"
        return {
            "sub": f"usr_test_{role}",
            "email": f"{role}@{tenant}.com",
            "role": role,
            "tenantId": tenant,
            "privileges": ["ops_console", "social_studio", "manage_services"],
        }

    try:
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=[settings.BETTER_AUTH_ALGORITHM],
            options={"verify_exp": True},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.InvalidTokenError, Exception) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Security(bearer_scheme)] = None,
) -> AuthenticatedUser | None:
    """Extract authenticated user if bearer token is present, otherwise return None."""
    if not credentials or not credentials.credentials:
        return None

    payload = decode_jwt_token(credentials.credentials)
    privileges = payload.get("privileges", [])
    if isinstance(privileges, str):
        import json
        try:
            privileges = json.loads(privileges)
        except Exception:
            privileges = [privileges]

    return AuthenticatedUser(
        id=str(payload.get("sub") or payload.get("id", "")),
        email=str(payload.get("email", "")),
        name=payload.get("name"),
        role=str(payload.get("role", "customer")),
        tenant_id=str(payload.get("tenantId") or payload.get("tenant_id", "")),
        privileges=privileges,
    )


async def get_current_user(
    user: Annotated[AuthenticatedUser | None, Depends(get_optional_current_user)],
) -> AuthenticatedUser:
    """Strict dependency requiring a valid authenticated user."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def require_staff_user(
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> AuthenticatedUser:
    """Require user to be a staff member or business owner."""
    if not user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Staff privileges required",
        )
    return user


async def require_tenant_admin_user(
    user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> AuthenticatedUser:
    """Require user to be a business owner or super admin."""
    if not user.is_tenant_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Tenant administrator privileges required",
        )
    return user


def require_privilege(privilege_name: str) -> Callable:
    """Dependency factory checking for a specific staff privilege."""
    async def _check(
        user: Annotated[AuthenticatedUser, Depends(require_staff_user)],
    ) -> AuthenticatedUser:
        if not user.has_privilege(privilege_name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Missing '{privilege_name}' privilege",
            )
        return user

    return _check


def enforce_tenant_isolation(
    business_id: str,
    user: AuthenticatedUser,
) -> None:
    """Verify that the user has permission to access the specified business tenant."""
    if user.is_super_admin:
        return

    if user.tenant_id and user.tenant_id != business_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Multi-tenant isolation violation: User belongs to '{user.tenant_id}' "
                f"and cannot access resources for '{business_id}'."
            ),
        )
