"""
keyword_service.py — SERP API + OpenAI keyword extraction service.

Extracted from the original GraphicAIService.get_trending_keywords().
Pure, stateless, testable in isolation.
"""

from __future__ import annotations

import json
import logging
from typing import Optional

import requests
from openai import OpenAI

from app.config import APIKeys, ModelConfig, SystemPrompts

logger = logging.getLogger(__name__)


class KeywordService:
    """
    Fetches trending graphic design keywords for a given niche.

    Flow:
      1. (Optional) Query SERP API for real Google search snippets.
      2. Ask OpenAI LLM to extract / synthesize exactly 5 keywords as JSON.
    """

    def __init__(self) -> None:
        if not APIKeys.OPENAI:
            raise EnvironmentError("OPENAI_API_KEY is not set.")
        self.client = OpenAI(api_key=APIKeys.OPENAI)
        self.serpapi_key: Optional[str] = APIKeys.SERPAPI or None

    # ──────────────────────────────────────────────────────────────────────────

    def get_trending_keywords(self, niche: str) -> list[str]:
        """
        Returns a list of 5 trending design keywords for the given niche.

        Args:
            niche: Business/design niche (e.g. "luxury real estate").

        Returns:
            List of 5 keyword strings.

        Raises:
            Exception: If OpenAI call fails.
        """
        logger.info("[KeywordService] Fetching trends for niche='%s'", niche)
        context = self._fetch_serp_context(niche)
        keywords = self._extract_keywords_via_llm(niche, context)
        logger.info("[KeywordService] Keywords extracted: %s", keywords)
        return keywords

    # ──────────────────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _fetch_serp_context(self, niche: str) -> str:
        """Attempt a SERP API lookup; gracefully return empty string on failure."""
        if not self.serpapi_key:
            logger.debug("[KeywordService] No SERPAPI key — skipping SERP lookup.")
            return ""

        params = {
            "engine":  "google",
            "q":       f"trending design keywords for {niche} graphic design",
            "api_key": self.serpapi_key,
        }
        try:
            resp = requests.get("https://serpapi.com/search", params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            snippets = [r.get("snippet", "") for r in data.get("organic_results", [])[:5]]
            context = " ".join(snippets)
            logger.debug("[KeywordService] SERP context length: %d chars", len(context))
            return context
        except Exception as exc:
            logger.warning("[KeywordService] SERP API failed: %s — continuing without context.", exc)
            return ""

    def _extract_keywords_via_llm(self, niche: str, context: str) -> list[str]:
        """Ask the LLM to produce exactly 5 keywords as a JSON array."""
        if context:
            user_msg = (
                f"Based on the following search results about '{niche}' graphic design trends:\n"
                f"{context}\n\n"
                f"Extract exactly 5 current trending design keywords, visual motifs, or styles for this niche. "
                f"Return ONLY a valid JSON array of strings. Do not include markdown or code blocks."
            )
        else:
            user_msg = (
                f"List 5 current trending design keywords, visual motifs, or styles for the niche: '{niche}'. "
                f"Return ONLY a valid JSON array of strings. Do not include markdown or code blocks."
            )

        response = self.client.chat.completions.create(
            model=ModelConfig.LLM_MODEL,
            messages=[
                {"role": "system", "content": SystemPrompts.KEYWORD_EXTRACTOR},
                {"role": "user",   "content": user_msg},
            ],
            temperature=ModelConfig.LLM_TEMP,
        )
        content = response.choices[0].message.content.strip()
        return self._parse_keyword_response(content)

    @staticmethod
    def _parse_keyword_response(content: str) -> list[str]:
        """Robustly parse JSON array from LLM response with markdown-fence fallback."""
        # Strip markdown fences if present
        cleaned = content
        for fence in ("```json", "```"):
            cleaned = cleaned.replace(fence, "")
        cleaned = cleaned.strip()

        try:
            keywords = json.loads(cleaned)
            if isinstance(keywords, list):
                return [str(k) for k in keywords]
        except json.JSONDecodeError:
            pass

        # Fallback: comma-split
        logger.warning("[KeywordService] JSON parse failed — using comma split fallback.")
        return [k.strip() for k in cleaned.split(",") if k.strip()]
