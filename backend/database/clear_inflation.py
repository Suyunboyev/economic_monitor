"""
database/clear_inflation.py — inflation_rate uchun barcha qiymatlarni o'chiradi.
Bir martalik ishlatish uchun.

Ishlatish:
    cd backend
    python database/clear_inflation.py
"""
import asyncio
import os
import sys

import asyncpg

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.config import get_settings
from core.logging_config import configure_logging, get_logger

configure_logging()
log = get_logger(__name__)
settings = get_settings()


async def clear_inflation() -> None:
    log.info("Connecting to %s:%s/%s", settings.db_host, settings.db_port, settings.db_name)
    conn = await asyncpg.connect(
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
        user=settings.db_user,
        password=settings.db_password,
    )
    try:
        # Avval indicator_id ni topamiz
        row = await conn.fetchrow(
            "SELECT id FROM indicators WHERE name = 'inflation_rate'"
        )
        if not row:
            log.error("'inflation_rate' indicator topilmadi!")
            return

        indicator_id = row["id"]

        # Nechta yozuv borligini ko'ramiz
        count = await conn.fetchval(
            "SELECT COUNT(*) FROM indicator_values WHERE indicator_id = $1",
            indicator_id,
        )
        log.info("O'chirish oldidan: %d ta yozuv topildi.", count)

        # O'chiramiz
        deleted = await conn.execute(
            "DELETE FROM indicator_values WHERE indicator_id = $1",
            indicator_id,
        )
        log.info("Natija: %s", deleted)
        log.info("inflation_rate uchun barcha ma'lumotlar o'chirildi.")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(clear_inflation())