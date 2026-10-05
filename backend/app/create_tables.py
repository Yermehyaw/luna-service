"""Create the schema straight from the models.

Stands in for Alembic, which isn't wired up. Idempotent and create-only: it never
drops or alters anything. Once Alembic lands this is a dev convenience and
production schema changes go through migrations.
"""

import asyncio

from sqlalchemy import inspect

from app.core.database import dispose_engine, engine
from app.models import Base


async def create_tables() -> None:
    async with engine.connect() as connection:
        existing = set(
            await connection.run_sync(lambda sync: set(inspect(sync).get_table_names()))
        )

    missing = sorted(set(Base.metadata.tables) - existing)
    if not missing:
        print("All tables already exist, nothing to do.")
        return

    async with engine.begin() as connection:
        await connection.run_sync(
            Base.metadata.create_all,
            tables=[Base.metadata.tables[name] for name in missing],
        )

    print(f"Created tables: {', '.join(missing)}")


async def main() -> None:
    try:
        await create_tables()
    finally:
        await dispose_engine()


if __name__ == "__main__":
    asyncio.run(main())
