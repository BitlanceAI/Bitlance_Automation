"""
SERP LangChain Tools
Provides three tools backed by SerpAPI (Google Search JSON API) that replace
Perplexity for research-heavy tasks:

  1. TrendingTopicsTool   — replaces generate_title_and_keywords()
  2. KeywordResearchTool  — replaces generate_keywords()
  3. PlagiarismCheckTool  — replaces check_plagiarism()

Each tool is a proper LangChain BaseTool subclass so it can be dropped into
any LangChain agent or called standalone via tool.run(input).

SerpAPI call strategy (mirrors Graphic-agents keyword_service.py):
  Primary  — official `serpapi` Python client (google_trends_autocomplete engine)
  Fallback — raw HTTP request to serpapi.com/search.json
"""

import logging
import os
import json
import requests
from typing import Optional, Type

from langchain.tools import BaseTool
from pydantic import BaseModel, Field

class SerpRateLimitError(Exception):
    """Raised when SerpAPI returns a 429 Too Many Requests."""
    pass


logger = logging.getLogger(__name__)

SERP_API_KEY = os.getenv("SERP_API_KEY") or os.getenv("SERPAPI_API_KEY")
SERP_BASE_URL = "https://serpapi.com/search.json"


# ─────────────────────────────────────────────────────────────────────────────
# SHARED HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _serp_request(params: dict) -> dict:
    """Fire a SerpAPI request via raw HTTP and return parsed JSON. Raises on HTTP error."""
    if not SERP_API_KEY:
        raise RuntimeError("SERP_API_KEY is not set")
    params["api_key"] = SERP_API_KEY
    res = requests.get(SERP_BASE_URL, params=params, timeout=30)
    if res.status_code == 429:
        raise SerpRateLimitError(f"SerpAPI Rate Limit (429): {res.text}")
    res.raise_for_status()
    return res.json()


def _fetch_trends_autocomplete(query: str) -> list[str]:
    """
    Fetch trending autocomplete suggestions via SerpAPI google_trends_autocomplete.
    Mirrors Graphic-agents keyword_service.py:
      - Primary: official serpapi.Client
      - Fallback: raw HTTP request
    Returns up to 15 suggestion strings; returns [] gracefully on any failure.
    """
    if not SERP_API_KEY:
        logger.debug("[serp_tools] No SERP_API_KEY — skipping autocomplete lookup.")
        return []

    def _parse_suggestions(raw: list) -> list[str]:
        """Parse suggestions list that may contain dicts or plain strings.

        google_trends_autocomplete returns 'q' as a Knowledge Graph entity ID
        (e.g. '/m/02vkk45', '/g/11c6vfccs0') for topic-type entries.
        In those cases, 'title' holds the human-readable label — prefer it.
        """
        suggestions = []
        for item in raw:
            if isinstance(item, dict):
                q     = item.get("q", "")
                title = item.get("title") or item.get("value") or ""

                # KG entity IDs start with /m/ or /g/ — use title instead
                if q.startswith(("/m/", "/g/")):
                    label = title.strip()
                else:
                    label = (q or title).strip()

                if label:
                    suggestions.append(label)
            elif isinstance(item, str):
                s = item.strip()
                # Skip bare KG entity IDs that sometimes appear as plain strings
                if s and not s.startswith(("/m/", "/g/")):
                    suggestions.append(s)
        return suggestions[:15]

    # ── 1. Official serpapi client ────────────────────────────────────────────
    try:
        import serpapi  # google-search-results package

        client = serpapi.Client(api_key=SERP_API_KEY)
        results = client.search({
            "engine": "google_trends_autocomplete",
            "q": query,
        })
        suggestions_raw = results.get("suggestions", [])
        suggestions = _parse_suggestions(suggestions_raw)
        logger.debug("[serp_tools] serpapi.Client got %d autocomplete suggestions", len(suggestions))
        return suggestions

    except ImportError:
        logger.warning("[serp_tools] serpapi package not installed — falling back to requests.")
    except Exception as exc:
        logger.warning("[serp_tools] serpapi.Client autocomplete failed: %s — falling back.", exc)

    # ── 2. Raw HTTP fallback ──────────────────────────────────────────────────
    try:
        resp = requests.get(
            SERP_BASE_URL,
            params={
                "engine": "google_trends_autocomplete",
                "q": query,
                "api_key": SERP_API_KEY,
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        suggestions_raw = data.get("suggestions", data.get("autocomplete", []))
        suggestions = _parse_suggestions(suggestions_raw)
        logger.debug("[serp_tools] requests fallback got %d autocomplete suggestions", len(suggestions))
        return suggestions
    except Exception as exc:
        logger.warning("[serp_tools] Requests autocomplete fallback also failed: %s", exc)
        return []


def _current_year() -> int:
    from datetime import datetime
    return datetime.now().year


# ─────────────────────────────────────────────────────────────────────────────
# TOOL 1 — TRENDING TOPICS
# ─────────────────────────────────────────────────────────────────────────────

class TrendingTopicsInput(BaseModel):
    industry: str = Field(..., description="The industry or niche to find trending blog topics for.")


class TrendingTopicsTool(BaseTool):
    """
    Find trending blog topic + keyword ideas for a given industry.

    Strategy (mirrors Graphic-agents keyword_service.py):
      1. Query SerpAPI google_trends_autocomplete for real trending suggestions.
      2. Fall back to Google organic/PAA search if autocomplete yields nothing.

    Returns a dict: {"topic": str, "keywords": str}
    """

    name: str = "trending_topics"
    description: str = (
        "Use this tool to discover a trending blog topic and relevant SEO keywords "
        "for a given industry. Input: industry name. "
        "Output: JSON with 'topic' and 'keywords' fields."
    )
    args_schema: Type[BaseModel] = TrendingTopicsInput

    def _run(self, industry: str) -> dict:
        logger.info("[TrendingTopicsTool] Fetching trends for industry='%s'", industry)

        # ── Step 1: google_trends_autocomplete (primary) ──────────────────────
        suggestions = _fetch_trends_autocomplete(industry)

        if suggestions:
            # Use the first suggestion as the topic candidate
            topic = suggestions[0]
            # Use remaining suggestions (up to 5 more) as keyword signals
            keyword_candidates = suggestions[1:6]
        else:
            topic = None
            keyword_candidates = []

        # ── Step 2: Google organic/PAA search (fallback / enrichment) ─────────
        try:
            data = _serp_request({
                "q": f"trending {industry} blog topics {_current_year()}",
                "hl": "en",
                "gl": "us",
                "num": 10,
            })

            # PAA questions as additional topic candidates
            paa = data.get("related_questions", [])
            paa_topics = [q.get("question", "") for q in paa if q.get("question")]

            # Related searches as keyword signals
            related = data.get("related_searches", [])
            related_kws = [r.get("query", "") for r in related if r.get("query")]

            # Organic titles as fallback topic candidates
            organic = data.get("organic_results", [])
            organic_topics = [r.get("title", "") for r in organic[:5] if r.get("title")]

            # Pick topic: autocomplete first → PAA → organic title → fallback
            if not topic:
                topic = (paa_topics or organic_topics or [f"Top trends in {industry}"])[0]

            # Merge keyword signals: autocomplete suggestions + related searches
            keyword_candidates = keyword_candidates + related_kws

        except Exception as exc:
            logger.warning("[TrendingTopicsTool] Google organic search failed: %s", exc)
            if not topic:
                topic = f"Top trends in {industry}"

        # ── Build deduplicated keyword list (industry + signals, max 6) ────────
        seen: set[str] = set()
        keywords_list: list[str] = []
        for kw in [industry] + keyword_candidates:
            kw_clean = kw.strip()
            if kw_clean and kw_clean.lower() not in seen:
                seen.add(kw_clean.lower())
                keywords_list.append(kw_clean)
            if len(keywords_list) >= 6:
                break

        result = {
            "topic": topic,
            "keywords": ", ".join(keywords_list),
        }
        logger.info("[TrendingTopicsTool] Result: %s", result)
        return result

    async def _arun(self, industry: str) -> dict:  # pragma: no cover
        raise NotImplementedError("async not supported — use _run")


# ─────────────────────────────────────────────────────────────────────────────
# TOOL 2 — KEYWORD RESEARCH
# ─────────────────────────────────────────────────────────────────────────────

class KeywordResearchInput(BaseModel):
    topic: str = Field(..., description="The blog topic to research keywords for.")


class KeywordResearchTool(BaseTool):
    """
    Return a comma-separated list of high-value SEO keywords for a topic.

    Strategy (mirrors Graphic-agents keyword_service.py):
      1. Query SerpAPI google_trends_autocomplete for real trending suggestions.
      2. Enrich with Google organic related-searches and People Also Ask data.
    """

    name: str = "keyword_research"
    description: str = (
        "Use this tool to get real SEO keyword ideas for a blog topic. "
        "Input: topic string. "
        "Output: comma-separated keyword string."
    )
    args_schema: Type[BaseModel] = KeywordResearchInput

    def _run(self, topic: str) -> str:
        logger.info("[KeywordResearchTool] Researching keywords for topic='%s'", topic)

        keywords: list[str] = []

        # ── Step 1: google_trends_autocomplete (primary — mirrors Graphic-agents) ─
        suggestions = _fetch_trends_autocomplete(topic)
        keywords.extend(suggestions)
        logger.debug("[KeywordResearchTool] %d autocomplete suggestions", len(suggestions))

        # ── Step 2: Google organic related-searches + PAA (enrichment) ─────────
        try:
            data = _serp_request({
                "q": topic,
                "hl": "en",
                "gl": "us",
                "num": 10,
            })

            # Related searches (most reliable SEO signal)
            for item in data.get("related_searches", []):
                q = item.get("query", "").strip()
                if q:
                    keywords.append(q)

            # People Also Ask questions (longer-tail keywords)
            for item in data.get("related_questions", []):
                q = item.get("question", "").strip()
                if q:
                    keywords.append(q)

        except Exception as exc:
            logger.warning("[KeywordResearchTool] Google organic search failed: %s", exc)

        # ── Deduplicate while preserving order, cap at 10 ─────────────────────
        seen: set[str] = set()
        unique_kws: list[str] = []
        for kw in keywords:
            if kw.lower() not in seen:
                seen.add(kw.lower())
                unique_kws.append(kw)
            if len(unique_kws) >= 10:
                break

        # Always ensure the original topic is present
        if topic.lower() not in seen:
            unique_kws.insert(0, topic)

        result = ", ".join(unique_kws) if unique_kws else topic
        logger.info("[KeywordResearchTool] Keywords: %s", result)
        return result

    async def _arun(self, topic: str) -> str:  # pragma: no cover
        raise NotImplementedError("async not supported — use _run")


# ─────────────────────────────────────────────────────────────────────────────
# TOOL 3 — PLAGIARISM CHECK
# ─────────────────────────────────────────────────────────────────────────────

# Number of sentences to spot-check against Google
_SENTENCES_TO_CHECK = 5
# How many Google results must return an exact match to flag a sentence
_MATCH_THRESHOLD = 1


class PlagiarismCheckInput(BaseModel):
    blog_text: str = Field(..., description="The full blog text to check for plagiarism.")


class PlagiarismCheckTool(BaseTool):
    """
    Spot-check a blog post for plagiarism by searching key sentences on Google
    via SerpAPI and detecting verbatim matches in organic results.

    Returns a human-readable result string.
    """

    name: str = "plagiarism_check"
    description: str = (
        "Use this tool to check a blog post for plagiarism using real Google Search results. "
        "Input: full blog text. "
        "Output: plain-text plagiarism report."
    )
    args_schema: Type[BaseModel] = PlagiarismCheckInput

    def _run(self, blog_text: str) -> str:
        if not blog_text or not blog_text.strip():
            return "Plagiarism check skipped — empty content"

        # Extract candidate sentences (≥ 10 words, strip Markdown)
        import re
        clean = re.sub(r'[#*_\[\]()]', '', blog_text)
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', clean) if len(s.split()) >= 10]

        # Pick evenly-spaced sample sentences
        if len(sentences) <= _SENTENCES_TO_CHECK:
            sample = sentences
        else:
            step = len(sentences) // _SENTENCES_TO_CHECK
            sample = [sentences[i * step] for i in range(_SENTENCES_TO_CHECK)]

        flagged: list[str] = []

        for sentence in sample:
            # Use exact-phrase search (first 12 words for API reliability)
            query_words = sentence.split()[:12]
            query = '"' + " ".join(query_words) + '"'

            try:
                data = _serp_request({
                    "q": query,
                    "hl": "en",
                    "gl": "us",
                    "num": 5,
                })
                organic = data.get("organic_results", [])
                if len(organic) >= _MATCH_THRESHOLD:
                    for result in organic:
                        snippet = result.get("snippet", "").lower()
                        # Flag if 8+ words from query appear in the snippet
                        matches = sum(1 for w in query_words if w.lower() in snippet)
                        if matches >= 8:
                            source_url = result.get("link", "unknown source")
                            flagged.append(f'  • "{" ".join(query_words)}…" → {source_url}')
                            break
            except SerpRateLimitError as e:
                logger.warning("[PlagiarismCheckTool] Rate limit hit. Aborting SERP checks.")
                raise e
            except Exception as e:
                logger.warning("[PlagiarismCheckTool] SERP check error: %s", e)
                continue

        if not flagged:
            return "No plagiarism detected — all sampled sentences appear original."

        report = (
            f"⚠️ Potential plagiarism detected in {len(flagged)} sentence(s):\n"
            + "\n".join(flagged)
            + "\n\nReview and rewrite the flagged sections before publishing."
        )
        return report

    async def _arun(self, blog_text: str) -> str:  # pragma: no cover
        raise NotImplementedError("async not supported — use _run")


# ─────────────────────────────────────────────────────────────────────────────
# CONVENIENCE — pre-built instances ready to import
# ─────────────────────────────────────────────────────────────────────────────

trending_topics_tool  = TrendingTopicsTool()
keyword_research_tool = KeywordResearchTool()
plagiarism_check_tool = PlagiarismCheckTool()

# All three as a list for agent tool registration
ALL_SERP_TOOLS = [trending_topics_tool, keyword_research_tool, plagiarism_check_tool]
