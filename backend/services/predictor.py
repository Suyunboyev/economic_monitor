"""
services/predictor.py — inflyatsiya uchun bashorat (prediction) modeli.

Modellar:
  1. Linear Regression   — uzoq muddatli trend
  2. Exponential Smoothing (Holt) — qisqa muddatli trend
  3. Ensemble            — ikkalasining o'rtacha qiymati (asosiy natija)

Qaytariladi: har bir kelajak yil uchun { date, value, lower, upper } ro'yxati.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date
from typing import Optional

import numpy as np

from core.logging_config import get_logger

log = get_logger(__name__)


# ── Data classes ───────────────────────────────────────────────

@dataclass
class PredictionPoint:
    date: date
    value: float          # asosiy bashorat
    lower: float          # 80% ishonch oralig'i pastki chegarasi
    upper: float          # 80% ishonch oralig'i yuqori chegarasi
    model: str            # qaysi model


@dataclass
class InflationPrediction:
    historical: list[dict]          # tarixiy ma'lumotlar (as-is)
    predictions: list[PredictionPoint]
    model_info: dict                # model parametrlari va sifat ko'rsatkichlari


# ── Yordamchi funksiyalar ──────────────────────────────────────

def _year_of(d: date) -> int:
    return d.year


def _prepare_arrays(data: list[dict]) -> tuple[np.ndarray, np.ndarray]:
    """
    Tarixiy ma'lumotlardan X (yil) va y (inflyatsiya %) massivlarini tayyorlaydi.
    Bir yildan bir qiymat oladi (eng so'nggisini).
    """
    year_map: dict[int, float] = {}
    for point in data:
        try:
            yr = _year_of(date.fromisoformat(str(point["date"])))
            year_map[yr] = float(point["value"])
        except Exception:
            continue

    sorted_years = sorted(year_map.keys())
    X = np.array(sorted_years, dtype=float)
    y = np.array([year_map[yr] for yr in sorted_years], dtype=float)
    return X, y


# ── Model 1: Linear Regression ────────────────────────────────

def _linear_regression_predict(
    X: np.ndarray,
    y: np.ndarray,
    future_years: list[int],
) -> tuple[list[float], float, float]:
    """
    Eng kichik kvadratlar usuli bilan chiziqli trend.
    Qaytaradi: (bashorat qiymatlari, slope, intercept)
    """
    n = len(X)
    x_mean = X.mean()
    y_mean = y.mean()

    slope = float(np.sum((X - x_mean) * (y - y_mean)) / np.sum((X - x_mean) ** 2))
    intercept = float(y_mean - slope * x_mean)

    preds = [intercept + slope * yr for yr in future_years]

    # R² hisoblash
    y_hat = intercept + slope * X
    ss_res = float(np.sum((y - y_hat) ** 2))
    ss_tot = float(np.sum((y - y_mean) ** 2))
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0

    log.debug("Linear regression: slope=%.4f, intercept=%.4f, R²=%.4f", slope, intercept, r2)
    return preds, slope, r2


# ── Model 2: Holt Exponential Smoothing (double) ──────────────

def _holt_predict(
    y: np.ndarray,
    future_steps: int,
    alpha: float = 0.4,
    beta: float = 0.2,
) -> list[float]:
    """
    Holt ikki parametrli eksponensial silliqlash (trend bilan).
    alpha — daraja parametri, beta — trend parametri.
    """
    if len(y) < 2:
        return [float(y[-1])] * future_steps

    # Boshlang'ich qiymatlar
    level = float(y[0])
    trend = float(y[1] - y[0])

    for val in y[1:]:
        prev_level = level
        level = alpha * float(val) + (1 - alpha) * (level + trend)
        trend = beta * (level - prev_level) + (1 - beta) * trend

    preds = []
    for h in range(1, future_steps + 1):
        preds.append(level + h * trend)

    return preds


# ── Ishonch oralig'i hisoblash ─────────────────────────────────

def _confidence_interval(
    residuals: np.ndarray,
    horizon: int,
    z: float = 1.28,   # 80% CI uchun
) -> tuple[float, float]:
    """
    Qoldiq xatolar asosida prediction interval.
    Gorizontga qarab interval kengayib boradi.
    """
    std = float(np.std(residuals)) if len(residuals) > 1 else 1.0
    margin = z * std * math.sqrt(horizon)
    return -margin, +margin


# ── Asosiy prediction funksiyasi ───────────────────────────────

def predict_inflation(
    data: list[dict],
    years_ahead: int = 3,
) -> Optional[InflationPrediction]:
    """
    Tarixiy inflyatsiya ma'lumotlaridan kelajakdagi yillar uchun bashorat qiladi.

    Parameters
    ----------
    data        : [{"date": "YYYY-MM-DD", "value": float}, ...]
    years_ahead : necha yil oldinga bashorat qilish (default: 3)

    Returns
    -------
    InflationPrediction yoki None (ma'lumot yetarli bo'lmasa)
    """
    if len(data) < 4:
        log.warning("Bashorat uchun ma'lumot yetarli emas (kamida 4 ta yillik qiymat kerak)")
        return None

    X, y = _prepare_arrays(data)

    if len(X) < 4:
        log.warning("Yillik ma'lumot yetarli emas: %d ta topildi", len(X))
        return None

    last_year = int(X[-1])
    future_years = list(range(last_year + 1, last_year + years_ahead + 1))

    # ── Model 1: Linear Regression ──────────────────────────
    lr_preds, slope, r2 = _linear_regression_predict(X, y, future_years)

    # Qoldiq xatolarni hisoblaymiz (LR uchun)
    y_hat_hist = [slope * xi + (y.mean() - slope * X.mean()) for xi in X]
    residuals = y - np.array(y_hat_hist)

    # ── Model 2: Holt Smoothing ──────────────────────────────
    holt_preds = _holt_predict(y, years_ahead)

    # ── Ensemble: og'irlangan o'rtacha ──────────────────────
    # Oxirgi 3 yil uchun Holt ko'proq og'irlik (qisqa muddatli trend)
    # Linear regression uzoq muddatli trend uchun
    w_lr   = 0.4
    w_holt = 0.6
    ensemble_preds = [
        w_lr * lr + w_holt * h
        for lr, h in zip(lr_preds, holt_preds)
    ]

    # ── Prediction interval ──────────────────────────────────
    prediction_points: list[PredictionPoint] = []
    for i, (yr, val) in enumerate(zip(future_years, ensemble_preds)):
        horizon = i + 1
        lo_delta, hi_delta = _confidence_interval(residuals, horizon)

        # Manfiy inflyatsiyani cheklaymiz (deflyatsiya ehtimoli past)
        val_clipped = max(0.0, round(val, 2))
        lower = max(0.0, round(val + lo_delta, 2))
        upper = round(val + hi_delta, 2)

        prediction_points.append(PredictionPoint(
            date=date(yr, 12, 31),
            value=val_clipped,
            lower=lower,
            upper=upper,
            model="Ensemble (LR + Holt)",
        ))
        log.debug("Bashorat %d: %.2f%% [%.2f – %.2f]", yr, val_clipped, lower, upper)

    # ── Model sifati ─────────────────────────────────────────
    mae = float(np.mean(np.abs(residuals)))
    rmse = float(np.sqrt(np.mean(residuals ** 2)))

    model_info = {
        "algorithm":  "Ensemble: Linear Regression (40%) + Holt Exponential Smoothing (60%)",
        "data_points": int(len(X)),
        "year_range":  f"{int(X[0])}–{int(X[-1])}",
        "lr_r2":       round(r2, 4),
        "lr_slope":    round(slope, 4),
        "mae":         round(mae, 4),
        "rmse":        round(rmse, 4),
        "confidence":  "80%",
    }

    log.info(
        "Inflyatsiya bashorati tayyor: %d yil uchun | MAE=%.3f | RMSE=%.3f",
        years_ahead, mae, rmse,
    )

    return InflationPrediction(
        historical=data,
        predictions=prediction_points,
        model_info=model_info,
    )