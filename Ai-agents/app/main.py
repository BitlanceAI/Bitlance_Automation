from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.blog import router as blog_router

# ==================================================
# APP INITIALIZATION
# ==================================================

app = FastAPI(
    title="SEO AI Agent API",
    description="AI powered SEO and Blog generation agent",
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

# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "seo_ai_agent"
    }
