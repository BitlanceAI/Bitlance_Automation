"""
bitlance_ai — Official Python SDK for the Bitlance SEO/GEO Content Generation API
"""

import requests
import time
from typing import Any, Dict, Optional


# ─────────────────────────────────────────────────────────────────────────────
# Custom exception — exposes credit info on 402 errors
# ─────────────────────────────────────────────────────────────────────────────

class BitlanceAIError(Exception):
    """Raised on API errors. Check .status_code, .code, .credits_remaining."""
    def __init__(self, message: str, status_code: int = None, body: dict = None):
        super().__init__(message)
        self.status_code = status_code
        body = body or {}
        self.code = body.get("code")
        self.credits_remaining = body.get("credits_remaining")
        self.required_credits = body.get("required_credits")
        self.pricing_url = body.get("pricing_url")


# ─────────────────────────────────────────────────────────────────────────────
# Main client
# ─────────────────────────────────────────────────────────────────────────────

class BitlanceAI:
    """
    Bitlance AI API client.

    Usage::

        from bitlance_ai import BitlanceAI

        ai = BitlanceAI("sk_live_YOUR_API_KEY")
        result = ai.generate_seo(topic="Top EdTech Trends 2026", industry="Education")
        print(result["article"])
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.bitlancetechhub.com/api/v1",
        max_retries: int = 3,
        timeout: int = 300,
    ):
        if not api_key:
            raise ValueError("BitlanceAI: api_key is required")

        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.max_retries = max_retries
        self.timeout = timeout

        self._session = requests.Session()
        self._session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        })

    # ── Internal request helper ───────────────────────────────────────────────

    def _request(
        self,
        method: str,
        endpoint: str,
        json_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        attempt = 0

        while attempt < self.max_retries:
            try:
                response = self._session.request(
                    method, url, json=json_data, timeout=self.timeout
                )
                response.raise_for_status()
                return response.json()

            except requests.exceptions.HTTPError as exc:
                status = exc.response.status_code
                try:
                    body = exc.response.json()
                except Exception:
                    body = {}

                # Structured 402 — expose credit info
                if status == 402 and body.get("code") == "INSUFFICIENT_CREDITS":
                    raise BitlanceAIError(
                        f"Insufficient credits. You have {body.get('credits_remaining')} credits "
                        f"but need {body.get('required_credits')}. Top up at: {body.get('pricing_url')}",
                        status_code=status,
                        body=body,
                    )

                # Other 4xx — do not retry
                if 400 <= status < 500 and status != 429:
                    raise BitlanceAIError(
                        f"Bitlance API Error ({status}): {exc.response.text}",
                        status_code=status,
                        body=body,
                    )

                attempt += 1
                if attempt >= self.max_retries:
                    raise BitlanceAIError(
                        f"Bitlance API Error: Max retries reached. {exc}",
                        status_code=status,
                    )

            except requests.exceptions.RequestException as exc:
                attempt += 1
                if attempt >= self.max_retries:
                    raise BitlanceAIError(
                        f"Bitlance API Error: Max retries reached. {exc}"
                    )

            # Exponential backoff: 2s, 4s, 8s…
            time.sleep(2 ** attempt)

    # ── Blog Generation ───────────────────────────────────────────────────────

    def generate_seo(self, topic: str = None, **kwargs) -> Dict[str, Any]:
        """
        Generate a Google search-optimized SEO blog article.

        Args:
            topic (str): Blog topic (required unless ``industry`` is provided).
            keywords (str): Comma-separated target keywords.
            industry (str): Industry for research context.
            length (str): "Short", "Medium", or "Long (1500+ words)".
            language (str): Defaults to "English".
            brand_context_data (dict): {"company_name": ..., "additional_info": ...}

        Returns:
            dict: Keys include ``article``, ``markdown``, ``seoTitle``,
                  ``imageUrl``, ``wordCount``, ``keywords``.
        """
        params = {"topic": topic, **kwargs, "optimization_mode": "SEO"}
        if not params.get("topic") and not params.get("industry"):
            raise ValueError("topic or industry is required")
        return self._request("POST", "/blog/generate", params)

    def generate_geo(self, topic: str = None, **kwargs) -> Dict[str, Any]:
        """
        Generate a GEO-optimized blog for AI search engines (ChatGPT, Perplexity, etc.).

        Args:
            topic (str): Blog topic (required unless ``industry`` is provided).
            Same keyword args as generate_seo().

        Returns:
            dict: Same shape as generate_seo().
        """
        params = {"topic": topic, **kwargs, "optimization_mode": "GEO"}
        if not params.get("topic") and not params.get("industry"):
            raise ValueError("topic or industry is required")
        return self._request("POST", "/blog/generate", params)

    # ── Topic Research ────────────────────────────────────────────────────────

    def generate_topics(
        self,
        industry: str,
        mode: str = "SEO",
        location: str = "Global",
        goal: str = "Lead Generation",
    ) -> Dict[str, Any]:
        """
        Get AI-scored topic suggestions for a given industry.

        Returns:
            dict: ``{"industry": ..., "topics": [...]}``
        """
        if not industry:
            raise ValueError("industry is required")
        return self._request("POST", "/topic/generate", {
            "industry": industry,
            "mode": mode,
            "location": location,
            "goal": goal,
        })

    # ── Content Tools ─────────────────────────────────────────────────────────

    def audit_content(
        self,
        content: str,
        target_keyword: Optional[str] = None,
        mode: str = "SEO",
    ) -> Dict[str, Any]:
        """Run a SEO/GEO/EEAT audit on existing content."""
        if not content:
            raise ValueError("content is required")
        return self._request("POST", "/content/audit", {
            "content": content,
            "target_keyword": target_keyword,
            "mode": mode,
        })

    def rewrite_content(
        self,
        content: str,
        instructions: Optional[str] = None,
        mode: str = "SEO",
    ) -> Dict[str, Any]:
        """Rewrite and improve existing content."""
        if not content:
            raise ValueError("content is required")
        return self._request("POST", "/content/rewrite", {
            "content": content,
            "instructions": instructions,
            "mode": mode,
        })


__all__ = ["BitlanceAI", "BitlanceAIError"]
