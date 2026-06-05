import os
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_BASE_URL = "https://api.perplexity.ai/chat/completions"

class GeoRankTrackerRequest(BaseModel):
    query: str = Field(..., examples=["What are the best real estate lead generation tools?"])
    target_url: str = Field(..., examples=["example.com", "https://example.com"])

@router.post("/track")
def track_geo_rank(body: GeoRankTrackerRequest):
    if not PERPLEXITY_API_KEY:
        raise HTTPException(status_code=500, detail="PERPLEXITY_API_KEY not set")
    
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    # We ask Perplexity to act as a user-facing AI search engine
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "system", "content": "You are an AI search engine providing accurate, detailed answers with web citations."},
            {"role": "user", "content": body.query},
        ],
        "max_tokens": 1000,
    }
    
    try:
        res = requests.post(PERPLEXITY_BASE_URL, headers=headers, json=payload, timeout=60)
        res.raise_for_status()
        data = res.json()
        
        answer = data["choices"][0]["message"]["content"]
        citations = data.get("citations", [])
        
        # Clean target URL to find just the domain name or specific path
        target_domain = body.target_url.lower().replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        
        # Check if domain is in citations or answer
        mentioned_in_citations = any(target_domain in cit.lower() for cit in citations)
        mentioned_in_text = target_domain in answer.lower()
        
        is_cited = mentioned_in_citations or mentioned_in_text
        
        # Determine "Share of Voice" loosely - if it's the only citation, 100%, if 1 of 5, 20%, etc.
        share_of_voice = 0
        if mentioned_in_citations and len(citations) > 0:
            mention_count = sum(1 for cit in citations if target_domain in cit.lower())
            share_of_voice = round((mention_count / len(citations)) * 100)
        
        return {
            "success": True,
            "query": body.query,
            "target_url": body.target_url,
            "is_cited": is_cited,
            "mentioned_in_citations": mentioned_in_citations,
            "mentioned_in_text": mentioned_in_text,
            "share_of_voice_percent": share_of_voice,
            "citations": citations,
            "answer_preview": answer[:500] + "..." if len(answer) > 500 else answer
        }
        
    except Exception as e:
        print(f"Perplexity Geo Tracker Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
