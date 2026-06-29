"""
main.py — FastAPI application entrypoint
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from core.logging_config import configure_logging, get_logger
from routers.admin import router as admin_router
from routers.health import router as health_router
from routers.indicators import router as indicators_router
from routers.prediction import router as prediction_router
from services.fetcher import close_http_client, fetch_all
from services.scheduler import start_scheduler, stop_scheduler

configure_logging()
log = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    log.info("Starting Uzbekistan Economic Monitor API...")

    # Run initial data fetch (non-blocking — errors are logged not raised)
    try:
        log.info("Running initial data fetch...")
        await fetch_all()
    except Exception as exc:
        log.error("Initial fetch failed (non-fatal): %s", exc)

    # Start background scheduler
    start_scheduler()

    yield  # Application is running

    # Shutdown
    log.info("Shutting down...")
    stop_scheduler()
    await close_http_client()
    log.info("Shutdown complete.")


app = FastAPI(
    title="Uzbekistan Economic Indicators API",
    description=(
        "Real-time monitoring of Uzbekistan's key economic indicators: "
        "inflation, exchange rates, exports, imports, and trade balance."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(health_router)
app.include_router(indicators_router)
app.include_router(admin_router)
app.include_router(prediction_router)


@app.get("/", tags=["root"])
async def root():
    return {
        "service": "Uzbekistan Economic Monitor",
        "version": "1.0.0",
        "docs": "/docs",
    }