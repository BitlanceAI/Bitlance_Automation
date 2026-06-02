from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.geo_ai_service import generate_geo_faq

router = APIRouter()

class GeoRequest(BaseModel):
    topic: str
    target_audience: Optional[str] = "General"
    language: Optional[str] = "English"

@router.post("/generate-faq")
async def generate_faq_endpoint(request: GeoRequest):
    try:
        result = await generate_geo_faq(
            topic=request.topic,
            audience=request.target_audience,
            language=request.language
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
