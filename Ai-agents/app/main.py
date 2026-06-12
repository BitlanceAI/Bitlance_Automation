import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load main .env file from the Ai-agents directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
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

@app.get("/openapi.json", include_in_schema=False)
def custom_openapi(req: Request):
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
    
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    if "securitySchemes" not in openapi_schema["components"]:
        openapi_schema["components"]["securitySchemes"] = {}
        
    openapi_schema["components"]["securitySchemes"]["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Enter your Bitlance API Key."
    }
    
    for path in openapi_schema.get("paths", {}):
        if path not in ["/", "/api/blog/generate"]:
            for method in openapi_schema["paths"][path]:
                openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]

    # Hide Admin and internal endpoints from public Swagger unless universal key is provided
    dev_key = req.query_params.get("key")
    if dev_key != "bitlance":
        paths_to_remove = []
        for path in openapi_schema["paths"]:
            methods_to_remove = []
            for method in openapi_schema["paths"][path]:
                tags = openapi_schema["paths"][path][method].get("tags", [])
                if any(t in tags for t in ["Admin", "Admin API", "Tracking & Visibility", "Tracking API"]) or path.startswith("/api/v1/admin") or path.startswith("/api/geo-tracker") or path.startswith("/api/blog"):
                    methods_to_remove.append(method)
            for m in methods_to_remove:
                del openapi_schema["paths"][path][m]
            if not openapi_schema["paths"][path]:
                paths_to_remove.append(path)
                
        for p in paths_to_remove:
            del openapi_schema["paths"][p]
            
    return JSONResponse(openapi_schema)

@app.get("/docs", include_in_schema=False)
def custom_swagger_ui_html(req: Request):
    key = req.query_params.get("key", "")
    openapi_url = f"/openapi.json?key={key}" if key else "/openapi.json"
    return get_swagger_ui_html(
        openapi_url=openapi_url,
        title="Bitlance SEO/GEO API Docs",
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
