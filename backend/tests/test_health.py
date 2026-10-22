from unittest.mock import AsyncMock, MagicMock

from app.core.health import check_database


def _engine_that_raises_on_connect():
    engine = MagicMock()
    engine.connect.side_effect = ConnectionError("cannot reach database")
    return engine


def _engine_that_connects():
    connection = MagicMock()
    connection.execute = AsyncMock()
    engine = MagicMock()

    connect_cm = MagicMock()
    connect_cm.__aenter__ = AsyncMock(return_value=connection)
    connect_cm.__aexit__ = AsyncMock(return_value=False)
    engine.connect.return_value = connect_cm
    return engine


async def test_check_database_returns_true_when_reachable():
    assert await check_database(_engine_that_connects()) is True


async def test_check_database_returns_false_when_unreachable():
    assert await check_database(_engine_that_raises_on_connect()) is False


async def test_check_database_returns_false_when_query_fails():
    engine = _engine_that_connects()
    engine.connect.return_value.__aenter__.return_value.execute.side_effect = (
        RuntimeError("relation does not exist")
    )

    assert await check_database(engine) is False
