from fastapi import APIRouter, Request, HTTPException, Depends
from typing import Dict, Any
from app.services.blog_storage_service import get_admin_supabase

router = APIRouter()

def require_admin(request: Request):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    # In a production environment, verify the user has the 'admin' role in Supabase.
    return user_id

@router.get("/analytics/overview", summary="Admin Analytics Overview")
def get_analytics_overview(user_id: str = Depends(require_admin)):
    """
    Admin analytics endpoints to view usage, active users, revenue metrics, top endpoints, and token consumption.
    """
    try:
        sb = get_admin_supabase()
        
        # For simplicity without writing complex SQL RPCs, we sample the latest logs.
        # In a high-volume production app, this should be an RPC or a dedicated analytics DB.
        logs_res = sb.table("api_usage_logs").select("endpoint, tokens_used, user_id, response_time_ms").order("created_at", desc=True).limit(5000).execute()
        logs_data = logs_res.data or []
        
        total_requests_sampled = len(logs_data)
        total_tokens = sum((l.get("tokens_used") or 0) for l in logs_data)
        avg_response_time = sum((l.get("response_time_ms") or 0) for l in logs_data) / total_requests_sampled if total_requests_sampled > 0 else 0
        
        # Active Users (unique users in recent logs)
        active_users = len(set(l.get("user_id") for l in logs_data if l.get("user_id")))
        
        # Top Endpoints
        endpoints_count = {}
        for l in logs_data:
            ep = l.get("endpoint")
            if ep:
                endpoints_count[ep] = endpoints_count.get(ep, 0) + 1
        top_endpoints = sorted([{"endpoint": k, "hits": v} for k, v in endpoints_count.items()], key=lambda x: x["hits"], reverse=True)
        
        # Revenue Metrics
        billing_res = sb.table("api_billing_events").select("amount").eq("status", "succeeded").execute()
        total_revenue = sum(float(b.get("amount", 0)) for b in billing_res.data) if billing_res.data else 0.0
        
        # Subscriptions metrics
        subs_res = sb.table("api_subscriptions").select("plan_name").eq("status", "active").execute()
        plans_distribution = {}
        for s in (subs_res.data or []):
            p = s.get("plan_name")
            plans_distribution[p] = plans_distribution.get(p, 0) + 1

        return {
            "success": True,
            "metrics": {
                "recent_requests_sampled": total_requests_sampled,
                "recent_active_users": active_users,
                "recent_token_consumption": total_tokens,
                "average_response_time_ms": round(avg_response_time, 2),
                "total_revenue_usd": round(total_revenue, 2),
                "top_endpoints": top_endpoints[:5],
                "active_subscriptions_by_plan": plans_distribution
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# API KEY MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

import secrets
import string
from typing import Optional
from pydantic import BaseModel

VALID_PLANS = {"starter", "growth", "agency", "enterprise"}

class CreateAPIKeyRequest(BaseModel):
    """
    Provide either `client_email` (Bitlance looks up the user) or `user_id` directly.
    `label` is a human-readable name, e.g. 'Lotlite Edu - Growth Plan'.
    `expires_at` is an ISO 8601 datetime string or null for no expiry.
    """
    client_email: Optional[str] = None
    user_id: Optional[str] = None
    plan: str = "starter"
    label: Optional[str] = None
    expires_at: Optional[str] = None

class RevokeAPIKeyRequest(BaseModel):
    api_key: Optional[str] = None   # full sk_live_* string
    key_id: Optional[str] = None    # UUID from the list endpoint

def _generate_key() -> str:
    """Generate a secure API key in the same format as create_api_key.py CLI script."""
    alphabet = string.ascii_letters + string.digits
    random_str = "".join(secrets.choice(alphabet) for _ in range(48))
    return f"sk_live_{random_str}"

def _resolve_user_id(sb, client_email: Optional[str], user_id: Optional[str]) -> str:
    """Resolve to a Supabase user_id from either an email lookup or a direct UUID."""
    if user_id:
        return user_id

    if not client_email:
        raise HTTPException(
            status_code=400,
            detail="Provide either 'client_email' or 'user_id'."
        )

    # Look up via Supabase Admin Auth
    try:
        users_resp = sb.auth.admin.list_users()
        for u in users_resp:
            if u.email and u.email.lower() == client_email.lower():
                return u.id
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to look up users: {e}")

    raise HTTPException(
        status_code=404,
        detail=f"No Supabase user found with email '{client_email}'. Create their account first."
    )


@router.post("/api-keys/create", summary="Provision API Key for a Client")
def create_api_key(
    body: CreateAPIKeyRequest,
    user_id: str = Depends(require_admin)
):
    """
    Generate a new `sk_live_*` API key and store it in the `api_keys` table.

    - Pass `client_email` to auto-resolve the Supabase user (same as create_api_key.py CLI).
    - Or pass `user_id` directly if you already have it.
    - Plans: **starter** (10/min) | **growth** (30/min) | **agency** (60/min) | **enterprise** (120/min)

    Returns the plain-text key — store it safely, it is not retrievable again.
    """
    if body.plan not in VALID_PLANS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid plan '{body.plan}'. Choose from: {sorted(VALID_PLANS)}"
        )

    sb = get_admin_supabase()
    target_user_id = _resolve_user_id(sb, body.client_email, body.user_id)
    new_key = _generate_key()

    try:
        result = sb.table("api_keys").insert({
            "user_id": target_user_id,
            "api_key": new_key,
            "plan": body.plan,
            "status": "active",
            "label": body.label,
            "expires_at": body.expires_at,
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save API key: {e}")

    if not result.data:
        raise HTTPException(status_code=500, detail="Key insert returned no data.")

    rate_limits = {"starter": 10, "growth": 30, "agency": 60, "enterprise": 120}
    return {
        "success": True,
        "api_key": new_key,
        "user_id": target_user_id,
        "plan": body.plan,
        "rate_limit": f"{rate_limits[body.plan]} requests/min",
        "label": body.label,
        "expires_at": body.expires_at,
        "message": (
            f"Key provisioned successfully. "
            f"Send to client in Authorization header: 'Bearer {new_key}'"
        )
    }


@router.get("/api-keys/list", summary="List All Provisioned API Keys")
def list_api_keys(user_id: str = Depends(require_admin)):
    """
    Return all API keys in the system — useful to see which clients are active,
    their plans, and when their keys expire.
    The actual key value is masked (only the prefix is shown).
    """
    sb = get_admin_supabase()
    try:
        result = sb.table("api_keys").select(
            "id, user_id, plan, status, label, expires_at, created_at"
        ).order("created_at", desc=True).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "total": len(result.data or []),
        "keys": result.data or []
    }


@router.post("/api-keys/revoke", summary="Revoke a Client's API Key")
def revoke_api_key(
    body: RevokeAPIKeyRequest,
    user_id: str = Depends(require_admin)
):
    """
    Set the key's status to 'revoked'. The client will immediately receive 403 errors.
    Pass either the full `sk_live_*` key string as `api_key`, or the row UUID as `key_id`.
    """
    if not body.api_key and not body.key_id:
        raise HTTPException(status_code=400, detail="Provide either 'api_key' or 'key_id'.")

    sb = get_admin_supabase()
    try:
        query = sb.table("api_keys").update({"status": "revoked"})
        if body.key_id:
            query = query.eq("id", body.key_id)
        else:
            query = query.eq("api_key", body.api_key)
        result = query.execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not result.data:
        raise HTTPException(status_code=404, detail="API key not found.")

    revoked_key = result.data[0]
    return {
        "success": True,
        "message": "Key revoked. Client access is now blocked.",
        "revoked_key_id": revoked_key.get("id"),
        "revoked_key_prefix": (body.api_key or "")[:16] + "..." if body.api_key else revoked_key.get("id")
    }
