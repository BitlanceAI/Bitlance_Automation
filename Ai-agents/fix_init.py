with open("app/api/v1/__init__.py", "r") as f:
    content = f.read()

content = content.replace(
    "from app.api.v1.admin import router as admin_router",
    "from app.api.v1.admin import router as admin_router\nfrom app.api.v1.tracking import router as tracking_router"
)

content += 'router.include_router(tracking_router, tags=["Tracking API"])\n'

with open("app/api/v1/__init__.py", "w") as f:
    f.write(content)
