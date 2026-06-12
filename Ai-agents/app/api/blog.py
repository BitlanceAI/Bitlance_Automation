"""
Blog Generation API Router — internal service only.
Called by the Node.js server; Node.js already verified the JWT.
Python does NOT re-verify auth — this is an internal microservice.
"""

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

# Load main .env file from the Ai-agents directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

import requests as _requests
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.services import blog_ai_service as ai

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# REQUEST MODEL
# ─────────────────────────────────────────────────────────────────────────────

class GenerateBlogRequest(BaseModel):
    topic: Optional[str] = Field(default=None, examples=["Why Pune is the Best City for Real Estate Investment in 2026"])
    industry: Optional[str] = Field(default=None, examples=["Real Estate"])
    keywords: Optional[str] = Field(default="", examples=["Pune real estate, property investment Pune"])
    language: Optional[str] = Field(default="English")
    style: Optional[str] = Field(default="Professional")
    length: Optional[str] = Field(default="Medium (500-1000 words)")
    audience: Optional[str] = Field(default="General Public")
    image_option: Optional[str] = Field(default="auto")    # auto | custom | none
    custom_image_url: Optional[str] = None
    wp_url: Optional[str] = None            # website URL for interlinking (embedded in content)
    wp_api_url: Optional[str] = None        # actual WordPress site URL for REST API fetching (may differ from wp_url)
    interlinks: Optional[list] = None       # pre-built interlinks from Node.js [{title, link}]
    optimization_mode: Optional[str] = Field(default="SEO", description="SEO or GEO mode")
    author_name: Optional[str] = None
    author_image_url: Optional[str] = None
    brand_context_id: Optional[str] = None
    company_name: Optional[str] = Field(default=None, description="Provide your company name for white-labeled dynamic generation")
    brand_context_data: Optional[dict] = Field(default=None, description="Pass dynamic brand or business context as a dict (e.g., {'company_name': 'XYZ College', 'courses_offered': 'BCA, MCA', 'fee_structure': '$5000'}) to tailor the blog content directly.")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "topic": "Why Pune is the Best City for Real Estate Investment in 2026",
                    "industry": "Real Estate",
                    "keywords": "Pune real estate, property investment Pune, best places to invest in Pune",
                    "language": "English",
                    "style": "Professional and Data-driven",
                    "length": "Medium (500-1000 words)",
                    "audience": "Property Investors and First-time Homebuyers",
                    "image_option": "auto"
                }
            ]
        }
    }


LENGTH_MAPPING = {
    "Short (300-500 words)": 300,
    "Medium (500-1000 words)": 500,
    "Long (1000-2000 words)": 1000,
}


# ─────────────────────────────────────────────────────────────────────────────
# GENERATE ENDPOINT  (no auth — internal service called by Node.js only)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/generate")
def generate_blog(request: Request, body: GenerateBlogRequest):
    """
    Runs the full AI generation pipeline and returns JSON.
    Auth is handled upstream by Node.js. This endpoint is internal-only.
    """
    try:
        topic = body.topic
        keywords = body.keywords or ""
    
        auth_type = getattr(request.state, "auth_type", "jwt")
        user_id = getattr(request.state, "user_id", None)
    
        # ── 0. Credit Check for API Key Users ─────────────────────────────────────
        if auth_type == "api_key" and user_id:
            from app.services.blog_storage_service import validate_credits, ADMIN_ID
            try:
                mode_for_cost = body.optimization_mode.upper() if body.optimization_mode else "SEO"
                agent_type_for_cost = "geo_blog" if mode_for_cost == "GEO" else "seo_blog"

                credit_check = validate_credits(user_id, agent_type_for_cost, 1)
                if not credit_check["hasEnough"]:
                    raise HTTPException(status_code=402, detail="Payment Required: Insufficient credits. Please purchase more credits on your dashboard.")
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Credit validation failed: {str(e)}")
    
        # Fetch dynamic brand context if possible
        brand_context = None
        try:
            user_id = getattr(request.state, "user_id", None)
            
            # If brand_context_data is explicitly passed via API, use it
            if getattr(body, "brand_context_data", None):
                brand_context = body.brand_context_data
                if body.company_name and "company_name" not in brand_context:
                    brand_context["company_name"] = body.company_name
            # If company_name is explicitly passed via API, create an ephemeral brand context
            elif body.company_name:
                brand_context = {"company_name": body.company_name}
            # Otherwise, try to fetch the saved brand_context_id from the dashboard DB
            elif user_id and body.brand_context_id:
                from supabase import create_client
                sup_url = os.getenv("SUPABASE_URL")
                sup_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
                if sup_url and sup_key:
                    sup = create_client(sup_url, sup_key)
                    ctx_res = sup.table("brand_contexts").select("*").eq("id", body.brand_context_id).eq("user_id", user_id).execute()
                    if ctx_res.data:
                        brand_context = ctx_res.data[0]
                        print(f"Loaded specific brand context for user {user_id}")
        except Exception as e:
            print(f"Notice: Could not load dynamic brand context: {e}")
    
        # Resolve company_name and author_name
        company_name_str = body.company_name
        if brand_context and isinstance(brand_context, dict):
            if not company_name_str:
                company_name_str = brand_context.get("company_name")
        if not company_name_str:
            company_name_str = "Bitlance"

        # Determine dynamic author
        if not body.author_name:
            if "lotlite" in company_name_str.lower() or (brand_context and any("lotlite" in str(v).lower() for v in brand_context.values() if isinstance(v, str))):
                body.author_name = "Alok Kumar"
            else:
                body.author_name = f"{company_name_str} Editorial Team"
        # ── 1. Industry mode: auto-generate topic + keywords ──────────────────────
        if not topic and body.industry:
            mode_for_topic = body.optimization_mode.upper() if body.optimization_mode else "SEO"
            idea = ai.generate_title_and_keywords(body.industry, mode=mode_for_topic)
            
            if "topics" in idea and isinstance(idea["topics"], list) and len(idea["topics"]) > 0:
                first_idea = idea["topics"][0]
                topic = first_idea.get("topic")
                kw = first_idea.get("keywords", "")
                keywords = kw if isinstance(kw, str) else ", ".join(kw)
            else:
                topic = idea.get("topic")
                kw = idea.get("keywords", "")
                keywords = kw if isinstance(kw, str) else ", ".join(kw)
                
            if not keywords:
                keywords = ""
    
        if not topic:
            raise HTTPException(status_code=400, detail="topic or industry is required")
    
        # ── 2. Keyword generation ─────────────────────────────────────────────────
        if not keywords.strip():
            try:
                keywords = ai.generate_keywords(topic)
            except Exception as e:
                print(f"Perplexity keywords failed, falling back to OpenAI: {e}")
                keywords = ai.openai_generate_keywords(topic)
    
        # ── 3. WordPress interlinks (optional) ────────────────────────────────────
        # Use pre-built interlinks if provided by Node.js (e.g. from Supabase articles)
        if body.interlinks:
            # Normalise: each element must be {"title": str, "link": str}.
            # The client sometimes sends a plain list of URL strings instead of dicts.
            raw_links = body.interlinks
            interlinks = []
            for item in raw_links:
                if isinstance(item, dict):
                    # Already a dict — ensure both keys exist
                    title = item.get("title") or item.get("url") or str(item.get("link", ""))
                    link  = item.get("link")  or item.get("url") or ""
                    if link:
                        interlinks.append({"title": title or link, "link": link})
                elif isinstance(item, str) and item.strip():
                    # Plain URL string — use the URL as both title and link
                    interlinks.append({"title": item.strip(), "link": item.strip()})
                # else: skip malformed entries
            print(f"Using {len(interlinks)} pre-built interlinks from server")
        elif body.wp_api_url or body.wp_url:
            interlinks = []
            try:
                api_base = (body.wp_api_url or body.wp_url).rstrip("/")
                if not api_base.startswith("http"):
                    api_base = f"https://{api_base}"
                wp_res = _requests.get(
                    f"{api_base}/wp-json/wp/v2/posts?per_page=10", timeout=10
                )
                content_type = wp_res.headers.get("Content-Type", "")
                if wp_res.status_code == 200 and "application/json" in content_type:
                    posts = wp_res.json()
                    if isinstance(posts, list):
                        interlinks = [
                            {"title": p["title"]["rendered"], "link": p["link"]}
                            for p in posts
                            if "title" in p and "link" in p
                        ]
                        print(f"WP interlinks fetched: {len(interlinks)} posts from {api_base}")
                else:
                    print(f"WP interlinks skipped: {api_base} is not a WordPress REST API endpoint")
            except Exception as e:
                print(f"WP interlinks fetch failed for {api_base}: {type(e).__name__}: {e}")
        else:
            interlinks = []
    
        # ── 3.5 Backlink Intelligence Layer ───────────────────────────────────────
        backlink_analysis = None
        external_links = []
        try:
            print("Running Backlink Intelligence Layer...")
            backlink_analysis = ai.generate_backlink_analysis(topic, keywords, interlinks)
            if backlink_analysis:
                if "insertedLinks" in backlink_analysis:
                    interlinks = backlink_analysis["insertedLinks"]
                    print(f"Backlink Layer selected {len(interlinks)} highly relevant internal links.")
                if "externalLinks" in backlink_analysis:
                    external_links = backlink_analysis["externalLinks"]
                    print(f"Backlink Layer selected {len(external_links)} highly authoritative external links.")
        except Exception as e:
            print(f"Backlink Intelligence Layer failed: {e}")
            backlink_analysis = None
    
        # ── 3.6 Enforce 70:30 internal:external link ratio ────────────────────────
        # Hard cap: max 7 internal, max 3 external — regardless of what AI returned.
        # If fewer than 7 internals exist, allow up to 4 externals to fill the gap
        # but never exceed 10 total links or flip the majority to externals.
        MAX_INTERNAL = 7
        MAX_EXTERNAL = 3
        interlinks    = interlinks[:MAX_INTERNAL]
        external_links = external_links[:MAX_EXTERNAL]
        print(f"[Link Ratio] Internal: {len(interlinks)} | External: {len(external_links)} (target 7:3)")
    
        # ── 4. Content generation ─────────────────────────────────────────────────
        length_num = LENGTH_MAPPING.get(body.length, 500)
        mode = body.optimization_mode.upper() if body.optimization_mode else "SEO"
        try:
            content_result = ai.generate_blog_content(
                topic, keywords, body.language, body.audience, body.style,
                length_num, interlinks, external_links, mode=mode, brand_context=brand_context, author_name=body.author_name
            )
        except Exception as e:
            print(f"Content gen failed, falling back to OpenAI: {e}")
            content_result = ai.openai_generate_blog_content(
                topic, keywords, body.language, body.audience, body.style,
                length_num, interlinks, external_links, mode=mode, brand_context=brand_context, author_name=body.author_name
            )
    
        blog_text = content_result["blogText"]
        word_count = content_result["wordCount"]
    
        # ── 5. SEO title ──────────────────────────────────────────────────────────
        seo_title = ai.generate_seo_title(blog_text, topic)
    
        # ── 6. Plagiarism check ───────────────────────────────────────────────────
        plagiarism_check = ai.check_plagiarism(blog_text)
    
        # ── 7. Image ──────────────────────────────────────────────────────────────
        image_url = None
        if body.image_option == "auto":
            try:
                image_text = ai.generate_image_text(blog_text, topic)
                image_url = ai.generate_image(topic, image_text)  # raw OpenAI URL
            except Exception as e:
                print(f"Image generation failed: {e}")
        elif body.image_option == "custom":
            image_url = body.custom_image_url
    
        # ── 8. Skip Markdown → HTML conversion (Frontend uses ReactMarkdown) ──────
        blog_html = blog_text
    
        # ── 9. Return everything — Node.js handles persistence ────────────────────
        result_data = {
            "success": True,
            "article": blog_html,          # HTML content
            "markdown": blog_text,         # raw Markdown
            "seoTitle": seo_title,
            "imageUrl": image_url,         # raw URL (Node.js should upload to storage)
            "wordCount": word_count,
            "plagiarismCheck": plagiarism_check,
            "topic": topic,
            "keywords": keywords,
            "backlinkAnalysis": backlink_analysis,
        }
    
        # ── 10. Save to outputs folder for local debugging ─────────────────────────
        outputs_dir = Path(__file__).resolve().parent.parent.parent / "outputs"
        outputs_dir.mkdir(exist_ok=True)
        try:
            import json
            with open(outputs_dir / "last_blog.json", "w", encoding="utf-8") as f:
                json.dump(result_data, f, indent=2, ensure_ascii=False)
            with open(outputs_dir / "last_blog.html", "w", encoding="utf-8") as f:
                f.write(blog_html)
            print("Successfully saved blog output to outputs/ directory")
        except Exception as e:
            print(f"Failed to save to outputs directory: {e}")
    
        # ── 11. Deduct Credits for API Key Users ───────────────────────────────────
        if auth_type == "api_key" and user_id:
            from app.services.blog_storage_service import deduct_credits, get_admin_supabase, generate_slug, ADMIN_ID
            import time, math
            try:
                admin_sb = get_admin_supabase()
                slug = f"{generate_slug(seo_title)}-api-{int(time.time())}"
                
                from datetime import datetime
                from app.services.blog_storage_service import upload_image_to_supabase
                persisted_image_url = None
                if image_url:
                    persisted_image_url = upload_image_to_supabase(image_url, admin_sb)
                    result_data["imageUrl"] = persisted_image_url

                # Save a copy to their dashboard so reference_id exists
                payload = {
                    "user_id": user_id,
                    "topic": topic,
                    "content": blog_html,
                    "seo_title": seo_title,
                    "slug": slug,
                    "word_count": word_count,
                    "is_published": True,
                    "publish_date": datetime.utcnow().isoformat() + "Z",
                    "estimated_read_time": math.ceil(word_count/200),
                    "image_url": persisted_image_url,
                    "featured_image": persisted_image_url,
                    "author_name": body.author_name
                }
                # Always use 'articles' table for standard users
                saved = admin_sb.table("articles").insert(payload).select("id").execute()
                
                if saved.data:
                    saved_id = saved.data[0]["id"]
                    mode_for_cost = body.optimization_mode.upper() if body.optimization_mode else "SEO"
                    agent_type_for_cost = "geo_blog" if mode_for_cost == "GEO" else "seo_blog"

                    deduct_credits(
                        user_id=user_id,
                        agent_type=agent_type_for_cost,
                        reference_id=saved_id,
                        reference_table="articles",
                        usage_quantity=1,
                        metadata={"source": "api_key_public", "topic": topic}
                    )
            except Exception as e:
                print(f"Failed to deduct credits for API key user {user_id}: {e}")
    
        return result_data
    except Exception as general_error:
        import traceback
        error_trace = traceback.format_exc()
        print(f"500 ERROR IN GENERATE BLOG: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(general_error)}\n{error_trace}")


class TestImageRequest(BaseModel):
    topic: str = Field(..., examples=["The Future of PropTech in Commercial Real Estate"])
    image_text: Optional[str] = Field(default=None, examples=["PropTech Future"])

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "topic": "The Future of PropTech in Commercial Real Estate",
                    "image_text": "PropTech Future"
                }
            ]
        }
    }


@router.post("/test-image", summary="Test Image Generation Pipeline")
def test_image_generation(body: TestImageRequest):
    """
    Isolated endpoint to test the image generation pipeline and fallback tiers
    without running the entire blog generation process.
    """
    try:
        # Generate the small text for the image if not provided
        if not body.image_text:
            # We mock blog_text for the image text generator
            body.image_text = ai.generate_image_text(f"This is a blog about {body.topic}.", body.topic)

        image_url = ai.generate_image(body.topic, body.image_text)
        
        # Try to infer what model was used based on the result
        model_used = "unknown"
        if image_url.startswith("data:image/png;base64,"):
            if "iVBORw0KGgoAAAANSUhEUgAABQAAAAOACAYAAAC" in image_url[:100]: # Standard PIL blue background signature
                model_used = "PIL Placeholder (Fallback)"
            else:
                model_used = "gpt-image-2-2026-04-21 (or dall-e-3 fallback)"
        elif "dalle" in image_url or "openai" in image_url:
            model_used = "dall-e-3 (url)"

        return_data = {
            "success": True,
            "topic": body.topic,
            "image_text": body.image_text,
            "image_url": image_url,
            "inferred_model_used": model_used
        }

        # ── Save image to outputs folder ──────────────────────────────────────
        outputs_dir = Path(__file__).resolve().parent.parent.parent / "outputs"
        outputs_dir.mkdir(exist_ok=True)
        try:
            if image_url.startswith("data:image/png;base64,"):
                import base64
                b64_data = image_url.split(",")[1]
                with open(outputs_dir / "test_image.png", "wb") as f:
                    f.write(base64.b64decode(b64_data))
                print("Saved base64 image to outputs/test_image.png")
            elif image_url.startswith("http"):
                img_resp = _requests.get(image_url, timeout=30)
                if img_resp.status_code == 200:
                    with open(outputs_dir / "test_image.png", "wb") as f:
                        f.write(img_resp.content)
                    print("Downloaded URL image to outputs/test_image.png")
        except Exception as e:
            print(f"Failed to save test image to outputs directory: {e}")

        return return_data
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
