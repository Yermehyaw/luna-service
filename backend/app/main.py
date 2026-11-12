from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import dispose_engine
from app.core.health import HealthStatus, check_database
from app.routers import queue, ws
from app.realtime import broker, manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Opens the Redis subscription if Redis is reachable. If it is not, this
    # returns quietly and queue updates stay on this process — a missing Redis
    # must not stop the server booting.
    await broker.start(manager)
    yield
    await broker.stop()
    await dispose_engine()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the Luna Multi-Tenant Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(queue.router)
app.include_router(ws.router)


@app.get("/", tags=["Meta"])
async def root():
    return {"message": "Welcome to the Luna API"}


@app.get("/health", tags=["Meta"])
async def health_check():
    # A health endpoint that raises hides the outage behind a 500 and tells the
    # caller nothing about what's actually broken.
    try:
        database_ok = await check_database()
    except Exception:
        database_ok = False

    # Redis being down degrades realtime, it does not take the API down, so it is
    # reported alongside the database rather than folded into overall status.
    return {
        "status": HealthStatus.HEALTHY if database_ok else HealthStatus.DEGRADED,
        "checks": {"database": "ok" if database_ok else "unreachable"},
        "realtime": {
            "redis": "ok" if broker.redis_connected else "unreachable",
            "connections": manager.connection_count(),
        },
    }
