"""
database/fix_constraint.py — bir martalik tuzatish skripti.

Agar indicator_values jadvalidagi UNIQUE constraint nomi
"uq_indicator_date" bo'lmasa, uni to'g'ri nom bilan qayta yaratadi.

Ishlatish:
    python database/fix_constraint.py
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


async def fix_constraint() -> None:
    log.info("Connecting to %s:%s/%s", settings.db_host, settings.db_port, settings.db_name)
    conn = await asyncpg.connect(
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
        user=settings.db_user,
        password=settings.db_password,
    )
    try:
        # Check existing constraint names on indicator_values
        rows = await conn.fetch(
            """
            SELECT conname
            FROM   pg_constraint
            WHERE  conrelid = 'indicator_values'::regclass
            AND    contype  = 'u'
            """
        )
        existing = [r["conname"] for r in rows]
        log.info("Existing UNIQUE constraints on indicator_values: %s", existing)

        if "uq_indicator_date" in existing:
            log.info("Constraint 'uq_indicator_date' already exists. Nothing to do.")
            return

        # Drop the auto-named constraint if present
        for name in existing:
            log.info("Dropping old constraint: %s", name)
            await conn.execute(
                f'ALTER TABLE indicator_values DROP CONSTRAINT IF EXISTS "{name}"'
            )

        # Re-create with the correct name
        await conn.execute(
            """
            ALTER TABLE indicator_values
            ADD CONSTRAINT uq_indicator_date UNIQUE (indicator_id, date)
            """
        )
        log.info("Created constraint 'uq_indicator_date' successfully.")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(fix_constraint())