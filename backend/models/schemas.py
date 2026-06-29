"""
models/schemas.py — Pydantic request/response schemas
"""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ──────────────────────────────────────────────
# Indicator
# ──────────────────────────────────────────────
class IndicatorBase(BaseModel):
    name: str
    display_name: str
    category: str
    unit: str
    source: Optional[str] = None
    description: Optional[str] = None


class IndicatorRead(IndicatorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# ──────────────────────────────────────────────
# IndicatorValue
# ──────────────────────────────────────────────
class IndicatorValueBase(BaseModel):
    value: float
    date: date


class IndicatorValueRead(IndicatorValueBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    indicator_id: int
    fetched_at: datetime


# ──────────────────────────────────────────────
# Time-series response
# ──────────────────────────────────────────────
class TimeSeriesPoint(BaseModel):
    date: date
    value: float


class TimeSeriesResponse(BaseModel):
    indicator: IndicatorRead
    data: list[TimeSeriesPoint]


# ──────────────────────────────────────────────
# Latest values
# ──────────────────────────────────────────────
class LatestValue(BaseModel):
    indicator_id: int
    name: str
    display_name: str
    category: str
    unit: str
    value: float
    date: date
    fetched_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LatestValuesResponse(BaseModel):
    items: list[LatestValue]
    fetched_at: datetime


# ──────────────────────────────────────────────
# Health-check
# ──────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    db: str
    scheduler: str
    timestamp: datetime