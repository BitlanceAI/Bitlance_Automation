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
from app.api.geo_tracker import router as geo_tracker_router
from app.api.v1 import router as v1_router

app = FastAPI(
    title="Bitlance SEO/GEO API",
    description="Enterprise-grade Generative Engine Optimization (GEO) and SEO content generation platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Bitlance SEO/GEO API",
        version="1.0.0",
        description="""
# Bitlance API Platform

Welcome to the Bitlance Enterprise SEO/GEO Content API. 

## Authentication
All endpoints require an active API Key passed via the `Authorization` header:
`Authorization: Bearer <YOUR_API_KEY>`

## Rate Limits
Rate limits are enforced strictly based on your plan:
* **Starter:** 10 req/min
* **Growth:** 30 req/min
* **Agency:** 60 req/min
* **Enterprise:** 120 req/min

## Error Codes
- **401 Unauthorized**: Missing or invalid API key.
- **402 Payment Required**: Insufficient credits on your dashboard.
- **403 Forbidden**: API key is inactive or expired.
- **429 Too Many Requests**: Rate limit exceeded.
- **500 Internal Server Error**: Downstream generation or DB error.
        """,
        routes=app.routes,
    )
    
    # Add Bearer Auth to Swagger UI
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your Bitlance API Key."
        }
    }
    
    # Apply security globally to all paths except the root health check
    for path in openapi_schema.get("paths", {}):
        if path not in ["/", "/api/blog/generate"]:
            for method in openapi_schema["paths"][path]:
                openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
                
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

from app.api.auth_middleware import APIKeyAuthMiddleware

# Add API Key Authentication Middleware first (so it's an inner layer compared to CORS)
app.add_middleware(APIKeyAuthMiddleware)

# ==================================================
# CORS (frontend access)
# ==================================================

# CORSMiddleware must be added last so it becomes the outermost layer
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
