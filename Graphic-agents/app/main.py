"""
main.py — FastAPI application entry point.

Changes vs. original:
  • Structured logging configured at startup.
  • Outputs folder creation delegated to StorageConfig.
  • Health check now returns service metadata.
"""

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router as graphic_router
from app.config import StorageConfig

# ─── Logging Setup ────────────────────────────────────────────────────────────
# Configure once at the application root; all module-level loggers inherit this.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Graphic Agent API",
    description=(
        "AI-powered promotional graphic generation — powered by a LangChain agent "
        "with OpenAI gpt-image-2, SERP API trend fetching, and per-session memory."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static Files (generated images) ─────────────────────────────────────────
os.makedirs(StorageConfig.OUTPUT_FOLDER, exist_ok=True)
app.mount(
    "/outputs",
    StaticFiles(directory=StorageConfig.OUTPUT_FOLDER),
    name="outputs",
)

# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(graphic_router, prefix="/api")


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
def health_check():
    return {
        "status":  "ok",
        "service": "graphic_agent",
        "version": "2.0.0",
        "docs":    "/docs",
    }


logger.info("Graphic Agent API v2.0.0 initialized.")
