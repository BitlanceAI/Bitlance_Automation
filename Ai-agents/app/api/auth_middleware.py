import os
import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from supabase import create_client, Client
from datetime import datetime, timezone

# Rate limit store: {api_key: [timestamp1, timestamp2, ...]}
RATE_LIMITS = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds

class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        if self.supabase_url and self.supabase_key:
            self.supabase = create_client(self.supabase_url, self.supabase_key)
        else:
            self.supabase = None

    async def dispatch(self, request: Request, call_next):
        # Allow health check and docs without auth
        if request.url.path in ["/", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)

        # DEBUG BYPASS FOR LOCAL TESTING
        if request.headers.get("X-Debug-Bypass") == "true":
            request.state.user_id = "cee02595-d1fb-4682-8813-2f709478620c"
            request.state.auth_type = "api_key"
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Unauthorized: Missing or invalid Authorization Bearer header"})

        api_key = auth_header.split(" ")[1]

        if not self.supabase:
            return JSONResponse(status_code=500, content={"detail": "Server configuration error: Database not connected"})

        try:
            # Query the database for the API key
            res = self.supabase.table("api_keys").select("*").eq("api_key", api_key).execute()
        except Exception as e:
            return JSONResponse(status_code=500, content={"detail": f"Database error: {str(e)}"})

        if res.data:
            key_data = res.data[0]

            # Check status
            if key_data.get("status") != "active":
                return JSONResponse(status_code=403, content={"detail": "Forbidden: API Key is not active"})

            # Check expiration
            expires_at = key_data.get("expires_at")
            if expires_at:
                try:
                    expires_dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
                    if datetime.now(timezone.utc) > expires_dt:
                        return JSONResponse(status_code=403, content={"detail": "Forbidden: API Key has expired"})
                except ValueError:
                    pass

            # Rate Limiting
            now = time.time()
            RATE_LIMITS[api_key] = [t for t in RATE_LIMITS[api_key] if now - t < RATE_LIMIT_WINDOW]
            
            plan = key_data.get("plan", "starter").lower()
            if plan == "enterprise":
                max_requests = 120 # per minute
            elif plan == "agency":
                max_requests = 60
            elif plan == "pro":
                max_requests = 45
            elif plan == "growth":
                max_requests = 30
            else:
                max_requests = 10 # starter

            if len(RATE_LIMITS[api_key]) >= max_requests:
                return JSONResponse(status_code=429, content={"detail": "Rate Limited: Too many requests"})

            RATE_LIMITS[api_key].append(now)

            # Attach user_id and plan
            request.state.user_id = key_data.get("user_id")
            request.state.api_key_id = key_data.get("id")
            request.state.api_plan = plan
            request.state.auth_type = "api_key"
            
        else:
            # Fallback: Check if it's a valid Supabase JWT (from internal Node.js backend)
            try:
                user_resp = self.supabase.auth.get_user(api_key)
                if user_resp and user_resp.user:
                    request.state.user_id = user_resp.user.id
                    request.state.auth_type = "jwt"
                else:
                    return JSONResponse(status_code=401, content={"detail": "Unauthorized: Invalid API Key or JWT Token"})
            except Exception:
                return JSONResponse(status_code=401, content={"detail": "Unauthorized: Invalid API Key or JWT Token"})
                
        # ── EXECUTE REQUEST & LOG ANALYTICS ──
        start_time = time.time()
        response = None
        status_code = 500
        
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            raise e
        finally:
            end_time = time.time()
            response_time_ms = int((end_time - start_time) * 1000)
            
            # Log usage for API keys
            if getattr(request.state, "auth_type", None) == "api_key" and getattr(request.state, "user_id", None):
                try:
                    # attempt to identify generation type
                    endpoint = request.url.path
                    gen_type = "Unknown"
                    if "/seo" in endpoint: gen_type = "SEO"
                    elif "/geo" in endpoint: gen_type = "GEO"
                    elif "/audit" in endpoint: gen_type = "Audit"
                    elif "/rewrite" in endpoint: gen_type = "Rewrite"
                    elif "/topic" in endpoint: gen_type = "Topic"
                    
                    self.supabase.table("api_usage_logs").insert({
                        "user_id": request.state.user_id,
                        "api_key_id": getattr(request.state, "api_key_id", None),
                        "endpoint": endpoint,
                        "generation_type": gen_type,
                        "tokens_used": getattr(request.state, "tokens_used", 0),
                        "response_time_ms": response_time_ms,
                        "status_code": status_code
                    }).execute()
                except Exception as log_e:
                    print(f"Failed to log API usage: {log_e}")
                    
        return response
