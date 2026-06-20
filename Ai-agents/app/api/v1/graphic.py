"""
graphic.py — FastAPI router for the Graphic Agent API in Ai-agents.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.agent import GraphicAgent
from app.models import (
    GenerateFromPromptRequest,
    GenerateResponse,
    PromptEnhanceRequest,
    PromptEnhanceResponse,
    PropertyDetailsRequest,
    SocialPostRequest,
    SocialPostResponse,
)
# Direct service imports — used when use_agent=False
from app.services.image_service import ImageService
from app.services.prompt_service import PromptService

logger = logging.getLogger(__name__)

router = APIRouter()

# Singleton agent — cheap to reuse (stateless executor, memory is keyed externally)
_agent = GraphicAgent()


# ─────────────────────────────────────────────────────────────────────────────
# POST /generate_from_details
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/generate_from_details", response_model=GenerateResponse)
def generate_from_details(
    request: PropertyDetailsRequest,
    use_agent: bool = Query(default=True,  description="Route through agent (True) or direct service (False)"),
    session_id: str = Query(default="default", description="Session ID for agent memory scoping"),
):
    """
    Build a prompt from structured property/business details and generate an image.

    Agent mode (default):
        The agent decides whether to fetch trending keywords, which style to apply,
        and generates the image — all autonomously.

    Direct mode (use_agent=False):
        Deterministic path: build_prompt_from_details → generate_image.
    """
    try:
        if use_agent:
            logger.info("[Route: generate_from_details] Agent mode | session=%s", session_id)
            result = _agent.run_from_details(request.dict(), session_id=session_id)
            return _agent_result_to_response(result)

        # ── Direct (legacy-compatible) path ───────────────────────────────
        logger.info("[Route: generate_from_details] Direct mode")
        prompt_svc = PromptService()
        image_svc  = ImageService()

        prompt, keywords = prompt_svc.build_prompt_from_details(
            details=request.dict(),
            niche=request.niche,
        )
        size     = request.image_size    or "1024x1024"
        quality  = request.image_quality or "low"
        variants = request.num_variants  or 1

        results = image_svc.generate(prompt, quality=quality, size=size, num_variants=variants)
        b64_list = [r["b64_string"] for r in results if r["b64_string"]]

        return GenerateResponse(
            success=True,
            status="success",
            image_base64=b64_list[0] if b64_list else None,
            images_base64=b64_list,
            trending_keywords=keywords,
            image_size=size,
            image_quality=quality,
        )

    except Exception as exc:
        logger.exception("[Route: generate_from_details] Error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# POST /enhance_prompt
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/enhance_prompt", response_model=PromptEnhanceResponse)
def enhance_prompt(
    request: PromptEnhanceRequest,
    session_id: str = Query(default="default"),
):
    """
    Enhance a raw user prompt into a detailed image generation prompt.
    Always uses the direct prompt service (no agent overhead for this utility endpoint).
    """
    try:
        logger.info("[Route: enhance_prompt] raw='%s', niche='%s'", request.raw_prompt, request.niche)
        prompt_svc = PromptService()
        enhanced, keywords = prompt_svc.enhance_prompt(
            raw_prompt=request.raw_prompt,
            niche=request.niche,
        )
        return PromptEnhanceResponse(
            success=True,
            enhanced_prompt=enhanced,
            trending_keywords=keywords,
        )
    except Exception as exc:
        logger.exception("[Route: enhance_prompt] Error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# POST /generate_from_prompt
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/generate_from_prompt", response_model=GenerateResponse)
def generate_from_prompt(
    request: GenerateFromPromptRequest,
    use_agent: bool = Query(default=True),
    niche: Optional[str] = Query(default=None, description="Design niche for trend enrichment"),
    session_id: str = Query(default="default"),
):
    """
    Enhance a raw prompt (or pass a pre-built prompt) and generate an image.

    Agent mode: Agent decides whether to enhance first and handles image generation.
    Direct mode: Skips agent; calls ImageService directly with the supplied prompt.
    """
    try:
        if use_agent:
            logger.info("[Route: generate_from_prompt] Agent mode | session=%s", session_id)
            result = _agent.run_from_prompt(
                raw_prompt=request.prompt,
                niche=niche,
                image_size=request.image_size    or "1024x1024",
                image_quality=request.image_quality or "low",
                session_id=session_id,
            )
            return _agent_result_to_response(result)

        # ── Direct (legacy-compatible) path ───────────────────────────────
        logger.info("[Route: generate_from_prompt] Direct mode")
        image_svc = ImageService()
        size    = request.image_size    or "1024x1024"
        quality = request.image_quality or "low"

        results = image_svc.generate(request.prompt, size=size, quality=quality)
        result  = results[0]

        return GenerateResponse(
            success=True,
            status="success",
            image_url=f"/outputs/{result['filename']}",
            image_base64=result["b64_string"],
            image_size=size,
            image_quality=quality,
        )

    except Exception as exc:
        logger.exception("[Route: generate_from_prompt] Error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# POST /generate_social_post  —  Full pipeline endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/generate_social_post", response_model=SocialPostResponse)
def generate_social_post(request: SocialPostRequest):
    """
    Full social post pipeline: category → Google Trends → platform-aware captions → graphic.
    """
    try:
        logger.info(
            "[Route: generate_social_post] category='%s' platforms=%s",
            request.category, request.platforms,
        )
        from app.services.social_post_service import SocialPostService
        service = SocialPostService()

        result = service.generate_social_post(
            category=request.category,
            platforms=request.platforms,
            tone=request.tone or "professional",
            language=request.language or "English",
            extra_instructions=request.extra_instructions or "",
            image_quality=request.image_quality or "low",
        )

        images = result.get("images", [])
        image_b64 = images[0]["b64_string"] if images else None

        return SocialPostResponse(
            success=True,
            category=result["category"],
            trending_keywords=result["trending_keywords"],
            captions=result["captions"],
            graphic_prompt=result["graphic_prompt"],
            image_base64=image_b64,
        )

    except Exception as exc:
        logger.exception("[Route: generate_social_post] Error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────

def _agent_result_to_response(result: dict) -> GenerateResponse:
    """Convert the structured agent output dict into a GenerateResponse."""
    images   = result.get("images", [])
    b64_list = [img["b64_string"] for img in images if img.get("b64_string")]
    filename = images[0]["filename"] if images else None

    return GenerateResponse(
        success=result.get("success", False),
        status="success" if result.get("success") else "error",
        image_url=f"/outputs/{filename}" if filename else None,
        image_base64=b64_list[0]   if b64_list else None,
        images_base64=b64_list     if b64_list else None,
        trending_keywords=result.get("trending_keywords"),
    )
