"""
social_post_service.py — Social media post pipeline orchestrator.

Handles the full pipeline:
  1. Fetch trending keywords for a category via Google Trends (SerpAPI)
  2. Generate platform-aware captions using OpenAI
  3. Generate a graphic using the existing image generation pipeline

Each platform has different caption length limits and styles:
  - Twitter/X:  280 chars max — punchy, hashtag-dense
  - LinkedIn:   3000 chars max — professional, story-driven
  - Facebook:   500 chars max — conversational, emoji-friendly
  - Instagram:  2200 chars max — visual, hashtag-heavy (up to 30)
"""

from __future__ import annotations

import json
import logging
from typing import Optional

from openai import OpenAI

from app.config import APIKeys, ModelConfig, SystemPrompts
from app.services.keyword_service import KeywordService
from app.services.image_service import ImageService

logger = logging.getLogger(__name__)

# ─── Platform Specifications ─────────────────────────────────────────────────

PLATFORM_SPECS = {
    "twitter": {
        "max_chars": 280,
        "image_size": "1024x1024",
        "style": "Punchy, concise, witty. Use 2-3 trending hashtags. No fluff. Hook immediately.",
        "label": "Twitter/X",
    },
    "linkedin": {
        "max_chars": 3000,
        "image_size": "1024x1024",
        "style": "Professional, insightful, story-driven. Start with a bold hook line. Use line breaks for readability. Add 3-5 relevant hashtags at the end. Include a thought-leadership angle.",
        "label": "LinkedIn",
    },
    "facebook": {
        "max_chars": 500,
        "image_size": "1024x1024",
        "style": "Conversational, warm, emoji-friendly. Ask a question to drive engagement. Keep it relatable. 2-3 hashtags max.",
        "label": "Facebook",
    },
    "instagram": {
        "max_chars": 2200,
        "image_size": "1024x1024",
        "style": "Visual storytelling tone. Strong opening line (before the 'more' fold). Emoji-rich. Add up to 15 relevant hashtags at the end, mixing popular and niche tags.",
        "label": "Instagram",
    },
}


class SocialPostService:
    """
    Orchestrates the full social post generation pipeline:
      category → trends → captions → graphic
    """

    def __init__(self) -> None:
        if not APIKeys.OPENAI:
            raise EnvironmentError("OPENAI_API_KEY is not set.")
        self.client = OpenAI(api_key=APIKeys.OPENAI)
        self.keyword_svc = KeywordService()
        self.image_svc = ImageService()

    # ──────────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────────

    def generate_social_post(
        self,
        category: str,
        platforms: list[str],
        tone: str = "professional",
        extra_instructions: str = "",
        image_quality: str = "low",
    ) -> dict:
        """
        Full pipeline: category → trending keywords → captions per platform → graphic.

        Args:
            category:           The topic/niche for the post (e.g. "AI in healthcare")
            platforms:          List of target platforms (e.g. ["twitter", "linkedin"])
            tone:               Writing tone (professional, casual, inspiring, witty)
            extra_instructions: Optional extra context from the user
            image_quality:      Image quality for the graphic (low/medium/high/auto)

        Returns:
            {
                "success": True,
                "category": "...",
                "trending_keywords": [...],
                "captions": { "twitter": "...", "linkedin": "...", ... },
                "graphic_prompt": "...",
                "images": [ { "filepath", "filename", "b64_string" } ],
            }
        """
        logger.info(
            "[SocialPostService] Starting pipeline | category='%s' | platforms=%s",
            category, platforms,
        )

        # ── Step 1: Fetch trending keywords ──────────────────────────────────
        trending_keywords = self._fetch_trends(category)
        logger.info("[SocialPostService] Trending keywords: %s", trending_keywords)

        # ── Step 2: Generate captions per platform ───────────────────────────
        captions = {}
        for platform in platforms:
            platform_key = platform.lower()
            if platform_key not in PLATFORM_SPECS:
                logger.warning("[SocialPostService] Unknown platform '%s' — skipping.", platform)
                continue
            caption = self._generate_caption(
                category=category,
                platform=platform_key,
                trending_keywords=trending_keywords,
                tone=tone,
                extra_instructions=extra_instructions,
            )
            captions[platform_key] = caption

        # ── Step 3: Generate graphic ─────────────────────────────────────────
        graphic_prompt = self._build_graphic_prompt(category, trending_keywords)
        images = self.image_svc.generate(
            prompt=graphic_prompt,
            quality=image_quality,
            size="1024x1024",
            num_variants=1,
        )

        return {
            "success": True,
            "category": category,
            "trending_keywords": trending_keywords,
            "captions": captions,
            "graphic_prompt": graphic_prompt,
            "images": [
                {
                    "filepath": img["filepath"],
                    "filename": img["filename"],
                    "b64_string": img["b64_string"],
                }
                for img in images
            ],
        }

    # ──────────────────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _fetch_trends(self, category: str) -> list[str]:
        """Fetch trending keywords for the category. Returns [] on failure."""
        try:
            return self.keyword_svc.get_trending_keywords(category)
        except Exception as exc:
            logger.warning("[SocialPostService] Trend fetch failed: %s — continuing with AI-generated keywords.", exc)
            return self._fallback_keywords(category)

    def _fallback_keywords(self, category: str) -> list[str]:
        """Generate keywords purely from AI when SerpAPI is unavailable."""
        try:
            response = self.client.chat.completions.create(
                model=ModelConfig.LLM_MODEL,
                messages=[
                    {"role": "system", "content": "You are a social media trend analyst. Return ONLY a JSON array of 5 trending keywords/phrases for the given topic. No markdown."},
                    {"role": "user", "content": f"Topic: {category}"},
                ],
                temperature=0.7,
            )
            content = response.choices[0].message.content.strip()
            for fence in ("```json", "```"):
                content = content.replace(fence, "")
            content = content.strip()
            keywords = json.loads(content)
            return [str(k) for k in keywords] if isinstance(keywords, list) else []
        except Exception:
            return []

    def _generate_caption(
        self,
        category: str,
        platform: str,
        trending_keywords: list[str],
        tone: str,
        extra_instructions: str,
    ) -> str:
        """Generate a single platform-specific caption."""
        spec = PLATFORM_SPECS[platform]

        tone_guide = {
            "professional": "authoritative, clear, and professional",
            "casual": "friendly, conversational, and approachable",
            "inspiring": "motivational, uplifting, and thought-provoking",
            "witty": "clever, light-hearted, and engaging",
        }.get(tone, "professional")

        system_prompt = (
            f"You are an expert {spec['label']} content writer.\n"
            f"Write a post that feels authentic and gets high engagement.\n\n"
            f"Rules:\n"
            f"- STRICT max {spec['max_chars']} characters\n"
            f"- Platform style: {spec['style']}\n"
            f"- Tone: {tone_guide}\n"
            f"- Incorporate trending keywords naturally (don't force them)\n"
            f"- No generic filler. Sound like a real person.\n"
            f"- DO NOT use markdown asterisks (*) for formatting.\n"
            f"- Output ONLY the post text, nothing else.\n"
        )

        keywords_str = ", ".join(trending_keywords) if trending_keywords else "none available"
        user_message = (
            f"Write a {spec['label']} post about: {category}\n"
            f"Trending keywords to consider: {keywords_str}\n"
        )
        if extra_instructions:
            user_message += f"Additional instructions: {extra_instructions}\n"

        response = self.client.chat.completions.create(
            model=ModelConfig.LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.75,
            max_tokens=800,
        )
        caption = response.choices[0].message.content.strip()

        # Enforce max length
        if len(caption) > spec["max_chars"]:
            caption = caption[:spec["max_chars"] - 3].rsplit(" ", 1)[0] + "..."

        return caption

    def _build_graphic_prompt(self, category: str, trending_keywords: list[str]) -> str:
        """Build an image generation prompt for the social post graphic."""
        keywords_str = ", ".join(trending_keywords[:3]) if trending_keywords else ""

        system_prompt = (
            "You are an expert prompt engineer for AI image generation (gpt-image-2).\n"
            "Create a vivid, detailed image prompt for a social media post graphic.\n"
            "The image should be eye-catching, modern, and suitable for professional social media.\n"
            "NO text overlays, NO logos, NO watermarks — clean visual only.\n"
            "Return ONLY the image prompt, nothing else."
        )

        user_message = (
            f"Create a stunning social media graphic for a post about: {category}\n"
        )
        if keywords_str:
            user_message += f"Incorporate visual elements inspired by these trends: {keywords_str}\n"

        response = self.client.chat.completions.create(
            model=ModelConfig.LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.8,
        )
        return response.choices[0].message.content.strip()
