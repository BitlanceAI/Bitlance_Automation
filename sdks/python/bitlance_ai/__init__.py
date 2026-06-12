import requests
import time
from typing import Dict, Any, Optional

class BitlanceAIError(Exception):
    pass

class BitlanceAI:
    def __init__(self, api_key: str, base_url: str = "https://api.bitlancetechhub.com/api/v1", max_retries: int = 3, timeout: int = 300):
        if not api_key:
            raise ValueError("BitlanceAI: api_key is required")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.max_retries = max_retries
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        })

    def _request(self, method: str, endpoint: str, json_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        attempt = 0
        
        while attempt < self.max_retries:
            try:
                response = self.session.request(method, url, json=json_data, timeout=self.timeout)
                response.raise_for_status()
                return response.json()
            except requests.exceptions.HTTPError as e:
                attempt += 1
                status = e.response.status_code
                # Do not retry client errors except 429
                if 400 <= status < 500 and status != 429:
                    raise BitlanceAIError(f"Bitlance API Error ({status}): {e.response.text}")
                
                if attempt >= self.max_retries:
                    raise BitlanceAIError(f"Bitlance API Error: Max retries reached. {str(e)}")
                    
            except requests.exceptions.RequestException as e:
                attempt += 1
                if attempt >= self.max_retries:
                    raise BitlanceAIError(f"Bitlance API Error: Max retries reached. {str(e)}")
                    
            # Exponential backoff
            time.sleep(2 ** attempt)

    def generate_topics(self, industry: str, mode: str = "SEO", location: Optional[str] = "Global", goal: Optional[str] = "Lead Generation") -> Dict[str, Any]:
        if not industry:
            raise ValueError("industry is required")
        return self._request("POST", "/topic/generate", {
            "industry": industry, 
            "mode": mode,
            "location": location,
            "goal": goal
        })

    def generate_seo(self, params: Dict[str, Any]) -> Dict[str, Any]:
        if not params.get("topic") and not params.get("industry"):
            raise ValueError("topic or industry is required")
        return self._request("POST", "/seo/generate", params)

    def generate_geo(self, params: Dict[str, Any]) -> Dict[str, Any]:
        if not params.get("topic") and not params.get("industry"):
            raise ValueError("topic or industry is required")
        return self._request("POST", "/geo/generate", params)

    def audit_content(self, content: str, target_keyword: Optional[str] = None, mode: str = "SEO") -> Dict[str, Any]:
        if not content:
            raise ValueError("content is required")
        return self._request("POST", "/content/audit", {
            "content": content,
            "target_keyword": target_keyword,
            "mode": mode
        })

    def rewrite_content(self, content: str, instructions: Optional[str] = None, mode: str = "SEO") -> Dict[str, Any]:
        if not content:
            raise ValueError("content is required")
        return self._request("POST", "/content/rewrite", {
            "content": content,
            "instructions": instructions,
            "mode": mode
        })

    def track_keyword(self, article_url: str, target_keyword: str, optimization_mode: str = "SEO") -> Dict[str, Any]:
        return self._request("POST", "/tracking/keywords", {
            "article_url": article_url,
            "target_keyword": target_keyword,
            "optimization_mode": optimization_mode
        })

    def get_tracked_keywords(self) -> Dict[str, Any]:
        return self._request("GET", "/tracking/keywords")

    def poll_ai_visibility(self, target_keyword: str, expected_url: str) -> Dict[str, Any]:
        return self._request("POST", "/tracking/ai-visibility/poll", {
            "target_keyword": target_keyword,
            "expected_url": expected_url
        })

    def predict_traffic(self, search_volume: int, current_position: int, topic_growth_rate: float = 1.0) -> Dict[str, Any]:
        return self._request("POST", "/tracking/predict-traffic", {
            "search_volume": search_volume,
            "current_position": current_position,
            "topic_growth_rate": topic_growth_rate
        })
