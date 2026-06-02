import os
import logging

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
from app.api.video import router as video_router

app = FastAPI(
    title="GEO (Generative) AI Agent API",
    description="AI powered GEO and Blog generation agent",
    version="1.0.0"
)

# ==================================================
# CORS (frontend access)
# ==================================================

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
app.include_router(video_router, prefix="/api/video")

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
