import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.models import Base

DEFAULT_TEST_DATABASE_URL = (
    "postgresql+asyncpg://luna_user:luna_password@localhost:5432/luna_test_db"
)
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL", DEFAULT_TEST_DATABASE_URL)

# The suite drops every table on setup, so refuse to run against the dev database.
if "luna_db" in TEST_DATABASE_URL:
    raise RuntimeError(
        "TEST_DATABASE_URL points at the development database. Integration tests "
        "drop every table, so they must never run against luna_db."
    )

pytestmark = pytest.mark.integration


@pytest_asyncio.fixture(scope="session")
async def engine():
    test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    yield test_engine
    await test_engine.dispose()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _schema(engine):
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def session_factory(engine):
    return async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )


@pytest_asyncio.fixture
async def client(engine):
    # Real commits here. Endpoints call db.commit() themselves, so a session that
    # pretends to save wouldn't be testing the thing that matters.
    from app.core.database import get_db
    from app.main import app

    factory = async_sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )

    async def get_test_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = get_test_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as test_client:
        yield test_client
    app.dependency_overrides.clear()
