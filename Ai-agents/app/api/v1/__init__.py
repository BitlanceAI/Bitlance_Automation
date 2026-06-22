from fastapi import APIRouter
from app.api.v1.topic import router as topic_router
from app.api.v1.seo import router as seo_router
from app.api.v1.geo import router as geo_router
from app.api.v1.content import router as content_router
from app.api.v1.admin import router as admin_router
from app.api.v1.tracking import router as tracking_router
from app.api.v1.user_api_keys import router as user_keys_router

router = APIRouter()

router.include_router(topic_router, prefix="/topic", tags=["Topic API"])
router.include_router(seo_router, prefix="/seo", tags=["SEO API"])
router.include_router(geo_router, prefix="/geo", tags=["GEO API"])
router.include_router(content_router, prefix="/content", tags=["Content API"])
router.include_router(admin_router, prefix="/admin", tags=["Admin API"])
router.include_router(tracking_router, tags=["Tracking API"])
router.include_router(user_keys_router, prefix="/user/api-keys", tags=["User API Keys"])
