"""
ai_service.py — Backward-compatibility facade.

This module preserves the original GraphicAIService class interface so that
any external code (test_image.py, notebooks, etc.) that imports it continues
to work without modification.

Internally, all methods now delegate to the three focused service modules:
  • KeywordService  → get_trending_keywords()
  • PromptService   → enhance_prompt(), generate_prompt_from_details()
  • ImageService    → generate_image()

DO NOT add new business logic here. Add it to the respective service module.
"""

from __future__ import annotations

import logging
from typing import Optional

from app.services.keyword_service import KeywordService
from app.services.prompt_service import PromptService
from app.services.image_service import ImageService

logger = logging.getLogger(__name__)


class GraphicAIService:
    """
    Legacy facade — preserves the original public API surface.
    All methods delegate to the new modular services.
    """

    def __init__(self) -> None:
        # Services are instantiated on first use to keep __init__ lightweight
        self._keyword_svc: Optional[KeywordService] = None
        self._prompt_svc:  Optional[PromptService]  = None
        self._image_svc:   Optional[ImageService]   = None

    # ── Lazy accessors ────────────────────────────────────────────────────────

    @property
    def keyword_svc(self) -> KeywordService:
        if self._keyword_svc is None:
            self._keyword_svc = KeywordService()
        return self._keyword_svc

    @property
    def prompt_svc(self) -> PromptService:
        if self._prompt_svc is None:
            self._prompt_svc = PromptService()
        return self._prompt_svc

    @property
    def image_svc(self) -> ImageService:
        if self._image_svc is None:
            self._image_svc = ImageService()
        return self._image_svc

    # ── Original public API ───────────────────────────────────────────────────

    def get_trending_keywords(self, niche: str) -> list[str]:
        """Delegates to KeywordService.get_trending_keywords()."""
        logger.debug("[GraphicAIService facade] get_trending_keywords(niche=%s)", niche)
        return self.keyword_svc.get_trending_keywords(niche)

    def enhance_prompt(
        self,
        raw_prompt: str,
        niche: Optional[str] = None,
    ) -> tuple[str, list[str]]:
        """Delegates to PromptService.enhance_prompt()."""
        logger.debug("[GraphicAIService facade] enhance_prompt()")
        return self.prompt_svc.enhance_prompt(raw_prompt=raw_prompt, niche=niche)

    def generate_prompt_from_details(
        self,
        details: dict,
        niche: Optional[str] = None,
    ) -> tuple[str, list[str]]:
        """Delegates to PromptService.build_prompt_from_details()."""
        logger.debug("[GraphicAIService facade] generate_prompt_from_details()")
        return self.prompt_svc.build_prompt_from_details(details=details, niche=niche)

    def generate_image(
        self,
        prompt: str,
        quality: str = "low",
        size: str = "1024x1024",
        num_variants: int = 1,
    ) -> list[dict]:
        """Delegates to ImageService.generate()."""
        logger.debug("[GraphicAIService facade] generate_image(num_variants=%d)", num_variants)
        return self.image_svc.generate(
            prompt=prompt,
            quality=quality,
            size=size,
            num_variants=num_variants,
        )