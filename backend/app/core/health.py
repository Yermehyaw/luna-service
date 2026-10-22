from enum import StrEnum

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

from app.core.database import engine


class HealthStatus(StrEnum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"


async def check_database(target_engine: AsyncEngine | None = None) -> bool:
    active_engine = target_engine or engine
    try:
        async with active_engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
