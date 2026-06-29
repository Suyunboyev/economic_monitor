"""
services/indicator_service.py — database query helpers for indicators
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import desc, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.logging_config import get_logger
from models.orm import Indicator, IndicatorValue
from models.schemas import (
    IndicatorRead,
    LatestValue,
    TimeSeriesPoint,
    TimeSeriesResponse,
)

log = get_logger(__name__)


async def list_indicators(session: AsyncSession) -> list[IndicatorRead]:
    """Return all indicators ordered by category, then name."""
    result = await session.execute(
        select(Indicator).order_by(Indicator.category, Indicator.display_name)
    )
    indicators = result.scalars().all()
    return [IndicatorRead.model_validate(ind) for ind in indicators]


async def get_time_series(
    session: AsyncSession,
    name: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = 365,
) -> Optional[TimeSeriesResponse]:
    """Return time-series data for a named indicator."""
    ind_result = await session.execute(
        select(Indicator).where(Indicator.name == name)
    )
    indicator = ind_result.scalar_one_or_none()
    if indicator is None:
        return None

    query = (
        select(IndicatorValue)
        .where(IndicatorValue.indicator_id == indicator.id)
        .order_by(desc(IndicatorValue.date))
        .limit(limit)
    )
    if start_date:
        query = query.where(IndicatorValue.date >= start_date)
    if end_date:
        query = query.where(IndicatorValue.date <= end_date)

    values_result = await session.execute(query)
    values = values_result.scalars().all()

    # Sort ascending for chart display
    sorted_values = sorted(values, key=lambda v: v.date)

    return TimeSeriesResponse(
        indicator=IndicatorRead.model_validate(indicator),
        data=[TimeSeriesPoint(date=v.date, value=float(v.value)) for v in sorted_values],
    )


async def get_latest_values(session: AsyncSession) -> list[LatestValue]:
    """Return the most recent value for every indicator."""
    sql = text(
        """
        SELECT DISTINCT ON (i.id)
               i.id          AS indicator_id,
               i.name        AS name,
               i.display_name AS display_name,
               i.category    AS category,
               i.unit        AS unit,
               iv.value      AS value,
               iv.date       AS date,
               iv.fetched_at AS fetched_at
        FROM   indicators i
        JOIN   indicator_values iv ON iv.indicator_id = i.id
        ORDER  BY i.id, iv.date DESC, iv.fetched_at DESC
        """
    )
    result = await session.execute(sql)
    rows = result.mappings().all()
    return [
        LatestValue(
            indicator_id=row["indicator_id"],
            name=row["name"],
            display_name=row["display_name"],
            category=row["category"],
            unit=row["unit"],
            value=float(row["value"]),
            date=row["date"],
            fetched_at=row["fetched_at"],
        )
        for row in rows
    ]