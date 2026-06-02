"""
Video API Router.
Handles style analysis and cinematic reel script generation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.services import video_ai_service as video_service

router = APIRouter()

# Request Models
class AnalyzeStyleRequest(BaseModel):
    youtube_url: str = Field(..., examples=["https://www.youtube.com/watch?v=dQw4w9WgXcQ"])

class PropertyDetails(BaseModel):
    title: str = Field(..., examples=["The Royal Heritage"])
    location: str = Field(..., examples=["Central Park, New York"])
    price: str = Field(..., examples=["$2,500,000"])
    bhk: str = Field(..., examples=["4 BHK Penthouse"])
    amenities: List[str] = Field(default=[], examples=[["Infinity Pool", "Private Elevators", "Chef Kitchen"]])
    extra_details: Optional[str] = Field(default="", examples=["Stunning sunset views, marble floors throughout."])

class GenerateReelRequest(BaseModel):
    style_analysis: Dict[str, Any]
    property_details: Optional[PropertyDetails] = None
    topic_details: Optional[Dict[str, Any]] = None
    avatar: Optional[str] = "luxury_sophia"
    voice: Optional[str] = "en-US-Neural-Sophisticated"

# Endpoints
@router.post("/analyze-style")
def analyze_style(body: AnalyzeStyleRequest):
    """
    Analyzes a YouTube video URL and extracts structure, narration style, pacing,
    hooks, and transitions.
    """
    if not body.youtube_url or not body.youtube_url.strip():
        raise HTTPException(status_code=400, detail="youtube_url is required")
    
    try:
        result = video_service.analyze_video_style(body.youtube_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Style analysis failed: {str(e)}")

@router.post("/generate-reel")
def generate_reel(body: GenerateReelRequest):
    """
    Generates a scene-by-scene property/topic presentation script and visual cues
    customized to details, matching the reference style.
    """
    try:
        details = {}
        if body.property_details:
            details.update(body.property_details.dict())
        if body.topic_details:
            details.update(body.topic_details)

        script_data = video_service.generate_reel_script(
            style_analysis=body.style_analysis,
            property_details=details
        )
        return {
            "success": True,
            "script": script_data,
            "avatar": body.avatar,
            "voice": body.voice
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reel generation failed: {str(e)}")

