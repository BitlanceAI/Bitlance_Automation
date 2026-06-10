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
