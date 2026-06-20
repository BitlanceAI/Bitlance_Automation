import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load main .env file from the Ai-agents directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ==================================================
# STARTUP LOGGING (critical for Azure diagnostics)
# ==================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seo_ai_agent")

logger.info("=" * 60)
logger.info("GEO (Generative) AI Agent — starting up")
logger.info(f"  PORT            = {os.getenv('PORT', 'not set')}")
logger.info(f"  WEBSITES_PORT   = {os.getenv('WEBSITES_PORT', 'not set')}")
logger.info(f"  PERPLEXITY_API  = {'set' if os.getenv('PERPLEXITY_API_KEY') else 'NOT SET'}")
logger.info(f"  OPENAI_API      = {'set' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
logger.info(f"  GEMINI_API      = {'set' if os.getenv('GEMINI_API_KEY') else 'NOT SET'}")
logger.info(f"  SERP_API        = {'set' if os.getenv('SERP_API_KEY') else 'NOT SET'}")
logger.info(f"  SUPABASE_URL    = {'set' if os.getenv('SUPABASE_URL') else 'NOT SET'}")
logger.info("=" * 60)

# ==================================================
# APP INITIALIZATION
# ==================================================

from app.api.blog import router as blog_router
from app.api.geo_tracker import router as geo_tracker_router
from app.api.v1 import router as v1_router

app = FastAPI(
    title="Bitlance SEO/GEO API",
    description="Enterprise-grade Generative Engine Optimization (GEO) and SEO content generation platform.",
    version="1.0.0",
    docs_url=None,
    openapi_url=None,
    redoc_url=None
)


# ==================================================
# CORS (frontend access)
# ==================================================

from app.api.auth_middleware import APIKeyAuthMiddleware

app.add_middleware(APIKeyAuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # restrict later in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# ROUTES
# ==================================================

app.include_router(blog_router, prefix="/api/blog")
app.include_router(geo_tracker_router, prefix="/api/geo-tracker")
app.include_router(v1_router, prefix="/api/v1")

# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "seo_ai_agent",
        "port": os.getenv("PORT", "8000"),
    }

logger.info("App initialized successfully — routes registered")
