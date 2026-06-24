"""
prompt_service.py — Prompt engineering service layer.

Handles:
  • enhance_prompt()         — raw text → rich image prompt
  • build_prompt_from_details() — structured dict → rich image prompt

Extracted from GraphicAIService, now fully decoupled from keyword fetching.
Keywords are accepted as an optional pre-fetched parameter so the agent can
decide whether to call fetch_trending_keywords first or not.
"""

from __future__ import annotations

import json
import logging
import random
from typing import Optional

from openai import OpenAI

from app.config import (
    APIKeys,
    ModelConfig,
    SystemPrompts,
    STYLE_DESCRIPTIONS,
    CREATIVE_ADJECTIVES,
)

logger = logging.getLogger(__name__)


class PromptService:
    """
    Prompt engineering service. Two public methods:

      • enhance_prompt()           — for raw-text user inputs
      • build_prompt_from_details() — for structured property/business data

    Both return (prompt: str, trending_keywords: list[str]).
    """

    def __init__(self) -> None:
        if not APIKeys.OPENAI:
            raise EnvironmentError("OPENAI_API_KEY is not set.")
        self.client = OpenAI(api_key=APIKeys.OPENAI)

    # ──────────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────────

    def enhance_prompt(
        self,
        raw_prompt: str,
        niche: Optional[str] = None,
        trending_keywords: Optional[list[str]] = None,
    ) -> tuple[str, list[str]]:
        """
        Expand a short user prompt into a rich image generation prompt.

        If `trending_keywords` are not supplied and `niche` is given, they are
        fetched internally. Pass pre-fetched keywords to avoid double-fetching.

        Returns:
            (enhanced_prompt, trending_keywords_used)
        """
        logger.info("[PromptService.enhance_prompt] raw_prompt='%s', niche='%s'", raw_prompt, niche)

        # Resolve trending keywords
        used_keywords: list[str] = []
        trending_info = ""
        if niche:
            if trending_keywords:
                used_keywords = trending_keywords
            else:
                used_keywords = self._fetch_keywords(niche)

            if used_keywords:
                trending_info = (
                    f"\nFor the niche '{niche}', incorporate these trending design keywords/motifs "
                    f"visually: {', '.join(used_keywords)}.\n"
                )

        # Build system prompt with optional trend injection
        system = SystemPrompts.PROMPT_ENHANCER_SYSTEM + trending_info

        import re
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', raw_prompt)
        for url in urls:
            try:
                description = self._analyze_image(url)
                if description and description != url:
                    raw_prompt = raw_prompt.replace(url, f"[{url} -> Visually describes: {description}]")
            except Exception:
                pass

        response = self.client.chat.completions.create(
            model=ModelConfig.LLM_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": f"User Prompt: {raw_prompt}\nEnhanced Prompt:"},
            ],
            temperature=ModelConfig.LLM_TEMP,
        )
        enhanced = response.choices[0].message.content.strip()
        logger.info("[PromptService.enhance_prompt] Enhancement complete.")
        return enhanced, used_keywords

    def build_prompt_from_details(
        self,
        details: dict,
        niche: Optional[str] = None,
        trending_keywords: Optional[list[str]] = None,
    ) -> tuple[str, list[str]]:
        """
        Construct an image generation prompt from structured property/business details.

        Args:
            details:           Dict matching PropertyDetailsRequest fields.
            niche:             Override or fallback niche string.
            trending_keywords: Pre-fetched keywords (skip internal fetch if provided).

        Returns:
            (prompt, trending_keywords_used)
        """
        logger.info("[PromptService.build_prompt_from_details] details keys=%s", list(details.keys()))

        # ── Style resolution ────────────────────────────────────────────────
        template_id = details.get("template_id", "random")
        style_prompt = STYLE_DESCRIPTIONS.get(template_id, STYLE_DESCRIPTIONS["random"])

        # ── Trending keywords ───────────────────────────────────────────────
        target_niche = niche or details.get("niche") or details.get("property_type", "real estate")
        used_keywords: list[str] = []
        trending_info = ""

        if trending_keywords:
            used_keywords = trending_keywords
        else:
            used_keywords = self._fetch_keywords(target_niche)

        if used_keywords:
            trending_info = (
                f" Incorporate trending design motifs for {target_niche}: {', '.join(used_keywords)}. "
            )

        # ── Color instruction (non-destructive) ─────────────────────────────
        theme_color = details.get("theme_color") or details.get("color_theme")
        color_instruction = ""
        if theme_color:
            color_instruction = (
                f" Use the color '{theme_color}' STRICTLY for text overlays, typography, borders, "
                "and graphic branding accents. Do NOT use this color to alter the physical scene "
                "or interior design elements (e.g., walls, furniture, lighting)."
            )

        # ── Reference Image ─────────────────────────────────────────────────
        reference_image = details.get("reference_image") or details.get("image_reference")
        reference_instruction = ""
        if reference_image:
            image_description = self._analyze_image(reference_image)
            reference_instruction = (
                f"\nIMPORTANT: First, artistically enhance and adjust the lighting, contrast, and mood of the provided reference image subject "
                f"('{image_description}') so that it perfectly matches the '{style_prompt}' aesthetic. "
                f"For example, if the template is bright but the reference is dark, intelligently brighten and harmonize the reference subject. "
                f"Then, seamlessly integrate this enhanced version into the graphic as a high-quality, polished photo insert or focal layout element."
            )

        # ── Creative twist for uniqueness ───────────────────────────────────
        random_twist = random.choice(CREATIVE_ADJECTIVES)

        user_message = (
            f"Details: {json.dumps(details)}\n"
            f"Style: {style_prompt}{color_instruction}\n"
            f"Inject a distinctly {random_twist} artistic feel to ensure uniqueness.\n"
            f"{trending_info}{reference_instruction}"
        )

        response = self.client.chat.completions.create(
            model=ModelConfig.LLM_MODEL,
            messages=[
                {"role": "system", "content": SystemPrompts.DETAILS_PROMPT_BUILDER_SYSTEM},
                {"role": "user",   "content": user_message},
            ],
            temperature=0.9,   # Higher temp for creative uniqueness
        )
        prompt = response.choices[0].message.content.strip()
        logger.info("[PromptService.build_prompt_from_details] Prompt built.")
        return prompt, used_keywords

    # ──────────────────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _analyze_image(self, image_url: str) -> str:
        """Helper to analyze an uploaded image URL using GPT-4o-mini Vision."""
        if not image_url or not image_url.startswith("http"):
            return image_url

        try:
            logger.info(f"[PromptService] Analyzing image URL with Vision: {image_url}")
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Analyze this image in extreme detail. Describe the architecture, lighting, subject matter, colors, and layout perfectly. Do not mention that it's an image. Just provide the visual description of the subject."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url,
                                }
                            },
                        ],
                    }
                ],
                max_tokens=300,
            )
            description = response.choices[0].message.content.strip()
            logger.info("[PromptService] Image analyzed successfully.")
            return description
        except Exception as exc:
            logger.warning("[PromptService] Image analysis failed: %s", exc)
            return image_url

    def _fetch_keywords(self, niche: str) -> list[str]:
        """Internal helper — fetch keywords via KeywordService. Returns [] on failure."""
        try:
            from app.services.keyword_service import KeywordService
            return KeywordService().get_trending_keywords(niche)
        except Exception as exc:
            logger.warning("[PromptService] Keyword fetch failed: %s", exc)
            return []
