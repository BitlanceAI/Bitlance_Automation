import os
import requests
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from app.api.auth_middleware import require_auth
from app.api.v1.schemas import AddTrackedKeywordRequest, TrackedKeywordResponse, AIVisibilityCheckRequest, AIVisibilityResponse
from supabase import create_client

router = APIRouter(prefix="/tracking", tags=["Tracking & Visibility"])

def get_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    return create_client(url, key)

@router.post("/keywords", response_model=TrackedKeywordResponse)
def add_tracked_keyword(request: Request, body: AddTrackedKeywordRequest):
    """
    Register a new URL + Keyword pair to the daily tracking engine.
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required for tracking")
        
    sup = get_supabase()
    
    # Check if already exists
    existing = sup.table("tracked_keywords").select("*").eq("user_id", user_id).eq("article_url", body.article_url).eq("target_keyword", body.target_keyword).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Keyword already tracked for this URL")
        
    res = sup.table("tracked_keywords").insert({
        "user_id": user_id,
        "article_url": body.article_url,
        "target_keyword": body.target_keyword,
        "optimization_mode": body.optimization_mode
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to insert tracked keyword")
        
    return TrackedKeywordResponse(
        id=res.data[0]["id"],
        article_url=body.article_url,
        target_keyword=body.target_keyword,
        optimization_mode=body.optimization_mode
    )

@router.get("/keywords", response_model=List[dict])
def list_tracked_keywords(request: Request):
    """
    List all tracked keywords for the current user, along with latest ranking and AI citation stats.
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
        
    sup = get_supabase()
    res = sup.table("tracked_keywords").select("*, seo_rank_logs(*), ai_citation_logs(*)").eq("user_id", user_id).execute()
    
    return res.data

@router.post("/ai-visibility/poll", response_model=AIVisibilityResponse)
def poll_ai_visibility(request: Request, body: AIVisibilityCheckRequest):
    """
    Performs an instant on-demand AI visibility check using Perplexity.
    Queries the AI engine for the target keyword and parses the response to see if our expected_url is cited.
    """
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="PERPLEXITY_API_KEY not configured")
        
    prompt = f"Provide a comprehensive answer or framework for: {body.target_keyword}. Include external citations and sources."
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "system", "content": "You are a helpful AI assistant. Provide a highly accurate response with citations."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1000
    }
    
    try:
        res = requests.post("https://api.perplexity.ai/chat/completions", headers=headers, json=payload, timeout=60)
        res.raise_for_status()
        data = res.json()
        content = data["choices"][0]["message"]["content"]
        
        # Check if expected URL or base domain was cited
        was_cited = body.expected_url.lower() in content.lower()
        
        # Extract citations list if available from sonar model
        citations = data.get("citations", [])
        citation_url_found = None
        for c in citations:
            if body.expected_url.lower() in c.lower() or c.lower() in body.expected_url.lower():
                citation_url_found = c
                was_cited = True
                break
                
        # If we didn't find the exact URL but found it in the text body
        if was_cited and not citation_url_found:
            citation_url_found = "Found in text body"
            
        return AIVisibilityResponse(
            ai_engine="Perplexity",
            was_cited=was_cited,
            citation_url_found=citation_url_found,
            engine_response_snippet=content[:200] + "..." if len(content) > 200 else content
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Polling failed: {str(e)}")

class TrafficPredictionRequest(BaseModel):
    search_volume: int
    current_position: int
    topic_growth_rate: float = 1.0  # 1.0 = stable, 1.2 = 20% growth

class TrafficPredictionResponse(BaseModel):
    estimated_monthly_clicks: int
    position_1_potential: int
    revenue_opportunity_score: int
    recommendation: str

@router.post("/predict-traffic", response_model=TrafficPredictionResponse)
def predict_traffic(request: Request, body: TrafficPredictionRequest):
    """
    Traffic Prediction Engine (Sprint 5).
    Estimates organic traffic based on standard CTR curves and search volume.
    """
    # Standard CTR Curve approximation
    ctr_map = {1: 0.31, 2: 0.14, 3: 0.09, 4: 0.06, 5: 0.04, 6: 0.03, 7: 0.02, 8: 0.02, 9: 0.01, 10: 0.01}
    
    current_ctr = ctr_map.get(body.current_position, 0.001)
    pos_1_ctr = ctr_map[1]
    
    estimated_clicks = int(body.search_volume * current_ctr * body.topic_growth_rate)
    potential_clicks = int(body.search_volume * pos_1_ctr * body.topic_growth_rate)
    
    # Revenue opportunity scales with potential uncaptured clicks
    lost_clicks = potential_clicks - estimated_clicks
    revenue_score = min(100, max(0, int((lost_clicks / max(1, potential_clicks)) * 100)))
    
    if body.current_position > 10:
        rec = "Keyword is not on page 1. Run through Audit API and Rewrite API immediately to inject proprietary benchmarks."
    elif body.current_position > 3:
        rec = "Striking distance. Focus strictly on external backlinks and EEAT citations."
    else:
        rec = "Maintain position. Ensure internal linking from supporting clusters points here."
        
    return TrafficPredictionResponse(
        estimated_monthly_clicks=estimated_clicks,
        position_1_potential=potential_clicks,
        revenue_opportunity_score=revenue_score,
        recommendation=rec
    )
