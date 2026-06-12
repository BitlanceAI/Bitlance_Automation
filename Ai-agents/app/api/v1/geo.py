from fastapi import APIRouter, Request, HTTPException
from app.api.blog import GenerateBlogRequest, generate_blog
from app.api.v1.schemas import StandardArticleResponse
from app.api.v1.parser import extract_structured_article

router = APIRouter()

@router.post("/generate", response_model=StandardArticleResponse, summary="GEO Content Generation API")
def generate_geo(request: Request, body: GenerateBlogRequest):
    """
    GEO API: 
    - GEO article generation
    - AI Overview
    - Quick Answers
    - Citation framework
    - Fact boxes
    """
    # Force GEO mode
    body.optimization_mode = "GEO"
    
    try:
        # Reuse the core generation logic
        result = generate_blog(request, body)
        
        # Parse into standard format
        return extract_structured_article(
            raw_markdown=result.get("markdown", ""),
            seo_title=result.get("seoTitle", ""),
            topic=result.get("topic", ""),
            keywords_str=result.get("keywords", "")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
