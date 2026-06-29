"""
core/config.py — application-wide settings loaded from .env
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Database ---
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "uzbekistan_econ"
    db_user: str = "postgres"
    db_password: str = "postgres"

    # --- FastAPI ---
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_reload: bool = True
    app_log_level: str = "info"

    # --- Scheduler ---
    fetch_interval_minutes: int = 60

    # --- External APIs ---
    open_exchange_rates_app_id: str = ""
    world_bank_base_url: str = "https://api.worldbank.org/v2"
    cbu_rates_url: str = "https://cbu.uz/en/arkhiv-kursov-valyut/json/"

    # --- CORS ---
    cors_origins: str = "http://localhost:8501,http://127.0.0.1:8501"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def database_url_sync(self) -> str:
        """Sync URL for Alembic / initial setup."""
        return (
            f"postgresql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()