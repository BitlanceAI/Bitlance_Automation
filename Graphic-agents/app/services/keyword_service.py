"""
keyword_service.py — SerpAPI (google-search-results client) + OpenAI keyword service.

Uses the official serpapi Python client with the google_trends_autocomplete engine
to fetch real-time trending search suggestions for a given niche/category.

Flow:
  1. Query SerpAPI google_trends_autocomplete for trending suggestions.
  2. Ask OpenAI LLM to synthesize exactly 5 actionable keywords as JSON.
"""

from __future__ import annotations

import json
import logging
from typing import Optional

from openai import OpenAI

from app.config import APIKeys, ModelConfig, SystemPrompts

logger = logging.getLogger(__name__)


class KeywordService:
    """
    Fetches trending keywords for a given niche using SerpAPI + OpenAI.

    Flow:
      1. Query SerpAPI google_trends_autocomplete for real trending suggestions.
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
        Returns a list of 5 trending keywords for the given niche.

        Args:
            niche: Business/content niche (e.g. "AI in healthcare").

        Returns:
            List of 5 keyword strings.

        Raises:
            Exception: If OpenAI call fails.
        """
        logger.info("[KeywordService] Fetching trends for niche='%s'", niche)
        suggestions = self._fetch_trends_autocomplete(niche)
        keywords = self._extract_keywords_via_llm(niche, suggestions)
        logger.info("[KeywordService] Keywords extracted: %s", keywords)
        return keywords

    # ──────────────────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _fetch_trends_autocomplete(self, niche: str) -> list[str]:
        """
        Fetch trending autocomplete suggestions via SerpAPI google_trends_autocomplete.
        Returns a list of suggestion strings; returns [] gracefully on any failure.
        """
        if not self.serpapi_key:
            logger.debug("[KeywordService] No SERPAPI key — skipping trends lookup.")
            return []

        try:
            import serpapi  # google-search-results package

            client = serpapi.Client(api_key=self.serpapi_key)
            results = client.search({
                "engine": "google_trends_autocomplete",
                "q": niche,
            })

            # Response uses 'suggestions' key (not 'autocomplete')
            # Each item: { "q": "...", "title": "...", "type": "..." }
            suggestions_raw = results.get("suggestions", [])
            suggestions = []
            for item in suggestions_raw:
                # Each item is typically {"q": "...", "type": "..."} or just a string
                if isinstance(item, dict):
                    q = item.get("q") or item.get("value") or item.get("title") or ""
                    if q:
                        suggestions.append(q)
                elif isinstance(item, str):
                    suggestions.append(item)

            logger.debug("[KeywordService] Got %d autocomplete suggestions", len(suggestions))
            return suggestions[:15]  # cap at 15 for LLM context

        except ImportError:
            logger.warning("[KeywordService] serpapi package not installed — falling back to requests.")
            return self._fetch_trends_via_requests(niche)
        except Exception as exc:
            logger.warning("[KeywordService] SerpAPI autocomplete failed: %s — continuing without.", exc)
            return []

    def _fetch_trends_via_requests(self, niche: str) -> list[str]:
        """Fallback using raw HTTP if serpapi package is unavailable."""
        try:
            import requests
            resp = requests.get(
                "https://serpapi.com/search.json",
                params={
                    "engine": "google_trends_autocomplete",
                    "q": niche,
                    "api_key": self.serpapi_key,
                },
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
            # Response uses 'suggestions' key
            suggestions_raw = data.get("suggestions", data.get("autocomplete", []))
            suggestions = []
            for item in suggestions_raw:
                if isinstance(item, dict):
                    q = item.get("q") or item.get("value") or item.get("title") or ""
                    if q:
                        suggestions.append(q)
                elif isinstance(item, str):
                    suggestions.append(item)
            return suggestions[:15]
        except Exception as exc:
            logger.warning("[KeywordService] Requests fallback also failed: %s", exc)
            return []

    def _extract_keywords_via_llm(self, niche: str, suggestions: list[str]) -> list[str]:
        """Ask the LLM to produce exactly 5 actionable keywords as a JSON array."""
        if suggestions:
            user_msg = (
                f"Google Trends autocomplete suggestions for '{niche}':\n"
                f"{json.dumps(suggestions)}\n\n"
                f"From these trending suggestions, extract exactly 5 specific, actionable "
                f"keywords or phrases most relevant for social media content about '{niche}'. "
                f"Return ONLY a valid JSON array of strings. No markdown, no code blocks."
            )
        else:
            user_msg = (
                f"List 5 current trending keywords, topics, or phrases for the niche: '{niche}'. "
                f"Focus on what's relevant for social media posts right now. "
                f"Return ONLY a valid JSON array of strings. No markdown, no code blocks."
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
