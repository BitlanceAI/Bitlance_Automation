from fastapi import APIRouter, Request, HTTPException
from app.api.blog import GenerateBlogRequest, generate_blog
from app.api.v1.schemas import StandardArticleResponse
from app.api.v1.parser import extract_structured_article

router = APIRouter()

@router.post("/generate", response_model=StandardArticleResponse, summary="SEO Content Generation API")
def generate_seo(request: Request, body: GenerateBlogRequest):
    """
    SEO API: 
    - SEO article generation
    - Internal linking
    - Metadata generation
    - Schema generation
    """
    # Force SEO mode
    body.optimization_mode = "SEO"
    
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
