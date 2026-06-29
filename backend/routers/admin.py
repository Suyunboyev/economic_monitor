"""
routers/health.py — health-check endpoint
"""
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from models.schemas import HealthResponse
from services.scheduler import scheduler_status

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Health check")
async def health_check(session: AsyncSession = Depends(get_db)) -> HealthResponse:
    """Check that the database and scheduler are running."""
    try:
        await session.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as exc:
        db_status = f"error: {exc}"

    return HealthResponse(
        status="ok" if db_status == "ok" else "degraded",
        db=db_status,
        scheduler=scheduler_status(),
        timestamp=datetime.utcnow(),
    )