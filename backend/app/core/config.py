from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    PROJECT_NAME: str = "Luna API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    DATABASE_URL: str = (
        "postgresql+asyncpg://luna_user:luna_password@localhost:5432/luna_db"
    )
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10

    REDIS_URL: str = "redis://localhost:6379"

    CLERK_PEM_PUBLIC_KEY: str = ""
    CLERK_ISSUER: str = ""

    # --- AI ---
    # Which AI backend to use. "auto" means: use OpenAI when a key is configured,
    # otherwise fall back to the local HuggingFace models, otherwise degrade to no
    # suggestion. This keeps the app runnable on a laptop and in CI with no key.
    AI_PROVIDER: str = "auto"

    # An empty key means "AI generation is unavailable", not "misconfigured". Callers
    # check availability up front instead of catching an auth error on first request.
    OPENAI_API_KEY: str = ""
    # Cost-first default, matching docs/AI.md. Larger models are a per-tenant upgrade,
    # never the global default, because generation is billed per token.
    OPENAI_MODEL: str = "gpt-4o-mini"
    # Generation is user-facing; a stalled request should fail over to "no suggestion"
    # rather than hold the connection open.
    OPENAI_TIMEOUT: float = 20.0
    # Bounded SDK-level retries for transient network/5xx errors, with backoff.
    OPENAI_MAX_RETRIES: int = 2

    # NoDecode stops pydantic-settings JSON-parsing the raw string first, which
    # fails on "http://a,http://b" before the validator runs.
    CORS_ORIGINS: Annotated[list[str], NoDecode] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"}

    @property
    def openai_configured(self) -> bool:
        # Single place to ask "is hosted generation possible?". Keeps provider selection
        # from scattering `if settings.OPENAI_API_KEY` across the AI module.
        return bool(self.OPENAI_API_KEY)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
