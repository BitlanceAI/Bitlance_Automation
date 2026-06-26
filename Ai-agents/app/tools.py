"""
tools.py — LangChain-compatible tool definitions for the Graphic Agent.

Architecture note:
  Each tool is a thin, typed wrapper around a pure service function.
  Tools carry no state — they receive inputs, call the service layer, and return
  structured JSON strings so the LangChain agent can reason about the output.

  Tool inputs are *string-based* (LangChain default), parsed inside each tool
  where structured data is needed.
"""

from __future__ import annotations

import json
import logging
from typing import Optional

from langchain.tools import tool

from app.config import ModelConfig, StorageConfig

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Tool 1 — Trending Keywords
# ─────────────────────────────────────────────────────────────────────────────

@tool
def fetch_trending_keywords(niche: str) -> str:
    """
    Fetch 5 current trending design keywords, visual motifs, or styles for a given
    graphic design niche using SERP API (for real Google results) + OpenAI for extraction.

    Args:
        niche: The design or business niche (e.g. "luxury real estate", "fitness").

    Returns:
        A JSON string representing a list of 5 trending keyword strings.
        Example: '["minimalist", "earth tones", "glass facades", ...]'
    """
    # Import here to avoid circular deps — service layer is stateless
    from app.services.keyword_service import KeywordService
    service = KeywordService()
    try:
        keywords = service.get_trending_keywords(niche)
        logger.info("[Tool: fetch_trending_keywords] niche=%s → %s", niche, keywords)
        return json.dumps(keywords)
    except Exception as exc:
        logger.error("[Tool: fetch_trending_keywords] FAILED: %s", exc)
        return json.dumps({"error": str(exc)})


# ─────────────────────────────────────────────────────────────────────────────
# Tool 2 — Raw Prompt Enhancer
# ─────────────────────────────────────────────────────────────────────────────

@tool
def enhance_raw_prompt(
    raw_prompt: str,
    niche: Optional[str] = None,
    trending_keywords: Optional[list[str]] = None,
    language: Optional[str] = "english",
) -> str:
    """
    Enhance a short user-written prompt into a rich, detailed image generation prompt.
    Optionally incorporates trending keywords for the given niche.

    Args:
        raw_prompt: The user's raw text prompt.
        niche: Design niche for trend enrichment (e.g. "real estate", "fitness").
        trending_keywords: Pre-fetched keywords to embed.
        language: Language of the flyer text ('english', 'hindi_marathi').

    Returns:
        A JSON string: {"enhanced_prompt": "...", "trending_keywords": [...]}
    """
    from app.services.prompt_service import PromptService
    service = PromptService()
    try:
        enhanced, used_keywords = service.enhance_prompt(
            raw_prompt=raw_prompt,
            niche=niche,
            trending_keywords=trending_keywords,
            language=language or "english",
        )
        logger.info("[Tool: enhance_raw_prompt] enhanced prompt generated.")
        return json.dumps({"enhanced_prompt": enhanced, "trending_keywords": used_keywords})
    except Exception as exc:
        logger.error("[Tool: enhance_raw_prompt] FAILED: %s", exc)
        return json.dumps({"error": str(exc)})


# ─────────────────────────────────────────────────────────────────────────────
# Tool 3 — Prompt Builder from Structured Details
# ─────────────────────────────────────────────────────────────────────────────

@tool
def build_prompt_from_details(
    details: dict,
    trending_keywords: Optional[list[str]] = None,
) -> str:
    """
    Build a detailed image generation prompt from structured property/business details.
    Always enforces text overlays for key information (price, contact, location).

    Args:
        details: A dictionary containing business/property fields like property_type, location, price, phone, etc.
        trending_keywords: Optional pre-fetched list of design motif keywords.

    Returns:
        A JSON string: {"prompt": "...", "trending_keywords": [...]}
    """
    from app.services.prompt_service import PromptService
    service = PromptService()
    try:
        niche = details.get("niche") or details.get("property_type")
        prompt, used_keywords = service.build_prompt_from_details(
            details=details,
            niche=niche,
            trending_keywords=trending_keywords,
        )
        logger.info("[Tool: build_prompt_from_details] prompt built successfully.")
        return json.dumps({"prompt": prompt, "trending_keywords": used_keywords})
    except Exception as exc:
        logger.error("[Tool: build_prompt_from_details] FAILED: %s", exc)
        return json.dumps({"error": str(exc)})


# ─────────────────────────────────────────────────────────────────────────────
# Tool 4 — Image Generator
# ─────────────────────────────────────────────────────────────────────────────

# Module-level cache: stores full results (including b64) from the last
# generate_image call so agent._parse_agent_output can retrieve them without
# the base64 data ever entering the LLM message context.
_last_image_results: list[dict] = []


@tool
def generate_image(
    prompt: str,
    quality: Optional[str] = None,
    size: Optional[str] = None,
    num_variants: Optional[int] = 1,
) -> str:
    """
    Generate one or more images using OpenAI's image model.
    Saves each image to the outputs folder.

    Args:
        prompt: The final image generation prompt.
        quality: Image quality level ('low', 'medium', 'high', 'auto').
        size: Image size dimensions (e.g. '1024x1024', '1536x1024').
        num_variants: Number of images to generate (default is 1).

    Returns:
        A compact JSON string listing generated image files: {"images": [{"filepath": "...", "filename": "..."}, ...]}
    """
    global _last_image_results
    from app.services.image_service import ImageService
    service = ImageService()
    try:
        q = quality or ModelConfig.IMAGE_DEFAULT_QUALITY
        sz = size or ModelConfig.IMAGE_DEFAULT_SIZE
        nv = num_variants or 1

        results = service.generate(
            prompt=prompt,
            quality=q,
            size=sz,
            num_variants=nv,
        )
        logger.info("[Tool: generate_image] %d image(s) generated.", len(results))

        # Cache full results (with b64) so the agent output parser can
        # retrieve them — never put b64 into the ToolMessage sent to the LLM.
        _last_image_results = results

        # Return only lightweight metadata to the LLM agent
        slim_results = [{"filepath": r["filepath"], "filename": r["filename"]} for r in results]
        return json.dumps({"images": slim_results, "count": len(slim_results)})
    except Exception as exc:
        logger.error("[Tool: generate_image] FAILED: %s", exc)
        _last_image_results = []
        return json.dumps({"error": str(exc)})


# ─────────────────────────────────────────────────────────────────────────────
# Tool 5 — Social Post Pipeline
# ─────────────────────────────────────────────────────────────────────────────

@tool
def generate_social_post(
    category: str,
    platforms: list[str],
    tone: Optional[str] = None,
    extra_instructions: Optional[str] = None,
    image_quality: Optional[str] = None,
) -> str:
    """
    Full social post pipeline: category → Google Trends → platform-aware captions → graphic.

    Args:
        category: Topic or niche for the post.
        platforms: List of platforms to write captions for (e.g. ["twitter", "linkedin"]).
        tone: Tone of the captions (default is 'professional').
        extra_instructions: Extra user context/instructions.
        image_quality: Quality of the generated graphic ('low', 'medium', etc.).

    Returns:
        A JSON string containing platform captions, keywords, and image metadata.
    """
    from app.services.social_post_service import SocialPostService
    service = SocialPostService()
    try:
        result = service.generate_social_post(
            category=category,
            platforms=platforms,
            tone=tone or "professional",
            extra_instructions=extra_instructions or "",
            image_quality=image_quality or "low",
        )
        # Strip b64 from tool output to avoid context overflow
        slim_result = {
            "success": result["success"],
            "category": result["category"],
            "trending_keywords": result["trending_keywords"],
            "captions": result["captions"],
            "graphic_prompt": result["graphic_prompt"],
            "images": [{"filepath": img["filepath"], "filename": img["filename"]} for img in result.get("images", [])],
        }
        logger.info("[Tool: generate_social_post] Pipeline complete for category='%s'", category)
        return json.dumps(slim_result)
    except Exception as exc:
        logger.error("[Tool: generate_social_post] FAILED: %s", exc)
        return json.dumps({"error": str(exc)})


# ─────────────────────────────────────────────────────────────────────────────
# Tool Registry — used by the agent executor
# ─────────────────────────────────────────────────────────────────────────────

ALL_TOOLS = [
    fetch_trending_keywords,
    enhance_raw_prompt,
    build_prompt_from_details,
    generate_image,
    generate_social_post,
]