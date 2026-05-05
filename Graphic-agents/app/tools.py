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
def enhance_raw_prompt(input_json: str) -> str:
    """
    Enhance a short user-written prompt into a rich, detailed image generation prompt.
    Optionally incorporates trending keywords for the given niche.

    Args:
        input_json: A JSON string with keys:
            - "raw_prompt" (str, required): The user's raw text prompt.
            - "niche" (str, optional): Design niche for trend enrichment.
            - "trending_keywords" (list[str], optional): Pre-fetched keywords to embed.

    Returns:
        A JSON string: {"enhanced_prompt": "...", "trending_keywords": [...]}
    """
    from app.services.prompt_service import PromptService
    service = PromptService()
    try:
        data = json.loads(input_json)
        raw_prompt: str = data["raw_prompt"]
        niche: Optional[str] = data.get("niche")
        trending_keywords: Optional[list] = data.get("trending_keywords")

        enhanced, used_keywords = service.enhance_prompt(
            raw_prompt=raw_prompt,
            niche=niche,
            trending_keywords=trending_keywords,
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
def build_prompt_from_details(input_json: str) -> str:
    """
    Build a detailed image generation prompt from structured property/business details.
    Always enforces text overlays for key information (price, contact, location).

    Args:
        input_json: A JSON string with keys matching PropertyDetailsRequest:
            property_type, location, price, bhk, builder, phone, email, address,
            amenities, extra_details, niche, template_id, theme_color,
            trending_keywords (optional pre-fetched list).

    Returns:
        A JSON string: {"prompt": "...", "trending_keywords": [...]}
    """
    from app.services.prompt_service import PromptService
    service = PromptService()
    try:
        details = json.loads(input_json)
        trending_keywords: Optional[list] = details.pop("trending_keywords", None)
        niche: Optional[str] = details.get("niche") or details.get("property_type")

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
def generate_image(input_json: str) -> str:
    """
    Generate one or more images using OpenAI's gpt-image-2 model.
    Saves each image to the outputs folder.

    Args:
        input_json: A JSON string with keys:
            - "prompt"        (str, required): The final image generation prompt.
            - "quality"       (str, optional): 'low', 'medium', 'high', 'auto'. Default: 'low'.
            - "size"          (str, optional): '1024x1024', '1536x1024', '1024x1536'. Default: '1024x1024'.
            - "num_variants"  (int, optional): Number of images to generate. Default: 1.

    Returns:
        A compact JSON string: {"images": [{"filepath": "...", "filename": "..."}, ...]}
        NOTE: base64 data is NOT included here to avoid LLM context overflow.
        The full results (with b64_string) are stored in _last_image_results.
    """
    global _last_image_results
    from app.services.image_service import ImageService
    service = ImageService()
    try:
        data = json.loads(input_json)
        prompt: str = data["prompt"]
        quality: str = data.get("quality", ModelConfig.IMAGE_DEFAULT_QUALITY)
        size: str = data.get("size", ModelConfig.IMAGE_DEFAULT_SIZE)
        num_variants: int = int(data.get("num_variants", 1))

        results = service.generate(
            prompt=prompt,
            quality=quality,
            size=size,
            num_variants=num_variants,
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
# Tool Registry — used by the agent executor
# ─────────────────────────────────────────────────────────────────────────────

ALL_TOOLS = [
    fetch_trending_keywords,
    enhance_raw_prompt,
    build_prompt_from_details,
    generate_image,
]
