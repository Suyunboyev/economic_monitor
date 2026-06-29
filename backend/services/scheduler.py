"""
services/scheduler.py — APScheduler background job management
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from core.config import get_settings
from core.logging_config import get_logger
from services.fetcher import fetch_all

log = get_logger(__name__)
settings = get_settings()

_scheduler: AsyncIOScheduler | None = None


def get_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler(timezone="Asia/Tashkent")
    return _scheduler


def start_scheduler() -> None:
    scheduler = get_scheduler()
    if scheduler.running:
        return

    scheduler.add_job(
        fetch_all,
        trigger=IntervalTrigger(minutes=settings.fetch_interval_minutes),
        id="fetch_all",
        name="Fetch all economic indicators",
        replace_existing=True,
        max_instances=1,
        misfire_grace_time=300,
    )
    scheduler.start()
    log.info(
        "Scheduler started — fetching every %d minutes.",
        settings.fetch_interval_minutes,
    )


def stop_scheduler() -> None:
    scheduler = get_scheduler()
    if scheduler.running:
        scheduler.shutdown(wait=False)
        log.info("Scheduler stopped.")


def scheduler_status() -> str:
    scheduler = get_scheduler()
    return "running" if scheduler.running else "stopped"