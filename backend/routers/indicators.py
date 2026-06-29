"""
routers/indicators.py — REST endpoints for indicators
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from models.schemas import IndicatorRead, LatestValuesResponse, TimeSeriesResponse
from services.indicator_service import (
    get_latest_values,
    get_time_series,
    list_indicators,
)

router = APIRouter(prefix="/api", tags=["indicators"])


@router.get("/indicators", response_model=list[IndicatorRead], summary="List all indicators")
async def read_indicators(session: AsyncSession = Depends(get_db)) -> list[IndicatorRead]:
    """Return metadata for all tracked economic indicators."""
    return await list_indicators(session)


@router.get(
    "/indicator/{name}",
    response_model=TimeSeriesResponse,
    summary="Get time-series data for an indicator",
)
async def read_indicator(
    name: str,
    start_date: Optional[date] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    limit: int = Query(365, ge=1, le=3000, description="Max number of records"),
    session: AsyncSession = Depends(get_db),
) -> TimeSeriesResponse:
    """Return the full time-series for a named indicator (e.g. `usd_uzs`)."""
    result = await get_time_series(
        session,
        name=name,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
    )
    if result is None:
        raise HTTPException(status_code=404, detail=f"Indicator '{name}' not found.")
    return result


@router.get(
    "/latest",
    response_model=LatestValuesResponse,
    summary="Get latest values for all indicators",
)
async def read_latest(session: AsyncSession = Depends(get_db)) -> LatestValuesResponse:
    """Return the most recent recorded value for every indicator."""
    from datetime import datetime
    items = await get_latest_values(session)
    return LatestValuesResponse(items=items, fetched_at=datetime.utcnow())