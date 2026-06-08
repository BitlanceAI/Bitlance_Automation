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
    topic = body.topic
    keywords = body.keywords or ""

    # Fetch dynamic brand context if possible
    brand_context = None
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            from supabase import create_client
            sup_url = os.getenv("SUPABASE_URL")
            sup_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
            if sup_url and sup_key and body.brand_context_id:
                sup = create_client(sup_url, sup_key)
                user_resp = sup.auth.get_user(token)
                if user_resp and user_resp.user:
                    user_id = user_resp.user.id
                    ctx_res = sup.table("brand_contexts").select("*").eq("id", body.brand_context_id).eq("user_id", user_id).execute()
                    if ctx_res.data:
                        brand_context = ctx_res.data[0]
                        print(f"Loaded specific brand context for user {user_id}")
    except Exception as e:
        print(f"Notice: Could not load dynamic brand context: {e}")


    # ── 1. Industry mode: auto-generate topic + keywords ──────────────────────
    if not topic and body.industry:
        idea = ai.generate_title_and_keywords(body.industry)
        topic = idea["topic"]
        keywords = idea["keywords"]

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

    # ── 4. Content generation ─────────────────────────────────────────────────
    length_num = LENGTH_MAPPING.get(body.length, 500)
    mode = body.optimization_mode.upper() if body.optimization_mode else "SEO"
    try:
        content_result = ai.generate_blog_content(
            topic, keywords, body.language, body.audience, body.style,
            length_num, interlinks, external_links, mode=mode, brand_context=brand_context
        )
    except Exception as e:
        print(f"Content gen failed, falling back to OpenAI: {e}")
        content_result = ai.openai_generate_blog_content(
            topic, keywords, body.language, body.audience, body.style,
            length_num, interlinks, external_links, mode=mode, brand_context=brand_context
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

    return result_data


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
