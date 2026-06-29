"""
routers/prediction.py — inflyatsiya bashorati uchun API endpoint
"""
from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from services.indicator_service import get_time_series
from services.predictor import InflationPrediction, predict_inflation

router = APIRouter(prefix="/api", tags=["prediction"])


# ── Response schemas ───────────────────────────────────────────

class PredictionPointOut(BaseModel):
    date: date
    value: float
    lower: float
    upper: float
    model: str


class InflationPredictionResponse(BaseModel):
    historical: list[dict]
    predictions: list[PredictionPointOut]
    model_info: dict


# ── Endpoint ───────────────────────────────────────────────────

@router.get(
    "/predict/inflation",
    response_model=InflationPredictionResponse,
    summary="Inflyatsiya bashorati",
    description=(
        "Tarixiy ma'lumotlar asosida kelajakdagi N yil uchun "
        "inflyatsiya foizini bashorat qiladi. "
        "Model: Ensemble (Linear Regression + Holt Exponential Smoothing). "
        "80% ishonch oralig'i bilan."
    ),
)
async def predict_inflation_endpoint(
    years_ahead: int = Query(3, ge=1, le=10, description="Necha yil oldinga bashorat qilish"),
    session: AsyncSession = Depends(get_db),
) -> InflationPredictionResponse:
    # Barcha tarixiy inflyatsiya ma'lumotlarini olamiz
    ts = await get_time_series(
        session,
        name="inflation_rate",
        limit=100,
    )
    if ts is None or not ts.data:
        raise HTTPException(
            status_code=404,
            detail="Inflyatsiya ma'lumotlari topilmadi. Avval ma'lumotlarni yangilang.",
        )

    historical = [{"date": str(p.date), "value": p.value} for p in ts.data]

    result: Optional[InflationPrediction] = predict_inflation(historical, years_ahead=years_ahead)

    if result is None:
        raise HTTPException(
            status_code=422,
            detail="Bashorat uchun ma'lumot yetarli emas (kamida 4 ta yillik qiymat kerak).",
        )

    return InflationPredictionResponse(
        historical=result.historical,
        predictions=[
            PredictionPointOut(
                date=p.date,
                value=p.value,
                lower=p.lower,
                upper=p.upper,
                model=p.model,
            )
            for p in result.predictions
        ],
        model_info=result.model_info,
    )