from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
from app.services import blog_ai_service as ai
from app.services.blog_storage_service import validate_credits
from app.api.v1.schemas import TopicResponse

router = APIRouter()

class TopicRequest(BaseModel):
    industry: str = Field(..., examples=["Real Estate", "SaaS"])
    mode: Optional[str] = Field("SEO", description="Target optimization mode: SEO or GEO")
    location: Optional[str] = Field("Global", description="Target location", examples=["Dubai", "Global"])
    goal: Optional[str] = Field("Lead Generation", description="Business goal", examples=["Lead Generation", "Direct Sales"])

@router.post("/generate", response_model=TopicResponse, summary="Topic Generation API")
def generate_topic(request: Request, body: TopicRequest):
    """
    Topic API: 
    - Trend discovery
    - Topic scoring
    - Top 10 topic generation
    - Search intent analysis
    """
    auth_type = getattr(request.state, "auth_type", "jwt")
    user_id = getattr(request.state, "user_id", None)

    if auth_type == "api_key" and user_id:
        try:
            credit_check = validate_credits(user_id, "blog", 1)
            if not credit_check["hasEnough"]:
                raise HTTPException(status_code=402, detail="Payment Required: Insufficient credits.")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Credit validation failed: {str(e)}")

    try:
        result = ai.generate_title_and_keywords(
            industry=body.industry, 
            mode=body.mode,
            location=body.location,
            goal=body.goal
        )
        topics_list = result.get("topics", [])
        
        candidates = []
        for t in topics_list:
            keywords_raw = t.get("keywords", "")
            if isinstance(keywords_raw, str):
                keywords = [k.strip() for k in keywords_raw.split(",") if k.strip()]
            else:
                keywords = keywords_raw # assuming it's already a list
            
            candidates.append({
                "topic": t.get("topic"),
                "keywords": keywords,
                "search_intent": t.get("search_intent", "Informational/Commercial"),
                "traffic_score": t.get("traffic_score", t.get("score")),
                "revenue_score": t.get("revenue_score", t.get("score")),
                "difficulty": t.get("difficulty", "Medium"),
                "scoring_breakdown": t.get("scoring_breakdown")
            })
            
        return TopicResponse(
            industry=body.industry,
            topics=candidates
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
