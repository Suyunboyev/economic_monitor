"""
database/init_db.py — run once to apply schema.sql and seed data
"""
import asyncio
import os
import sys

import asyncpg

# Allow running as standalone script
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.config import get_settings
from core.logging_config import configure_logging, get_logger

configure_logging()
log = get_logger(__name__)
settings = get_settings()

SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "schema.sql")


async def init_db() -> None:
    log.info("Connecting to PostgreSQL at %s:%s", settings.db_host, settings.db_port)
    conn = await asyncpg.connect(
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
        user=settings.db_user,
        password=settings.db_password,
    )
    try:
        with open(SCHEMA_FILE, "r") as f:
            sql = f.read()
        log.info("Applying schema from %s", SCHEMA_FILE)
        await conn.execute(sql)
        log.info("Schema applied successfully.")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(init_db())