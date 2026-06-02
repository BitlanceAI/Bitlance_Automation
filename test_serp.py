import requests
import os

SERP_API_KEY = os.getenv("SERP_API_KEY")
print("KEY:", SERP_API_KEY[:5] if SERP_API_KEY else None)

def _serp_request(params: dict) -> dict:
    if not SERP_API_KEY:
        raise RuntimeError("SERP_API_KEY is not set")
    params["api_key"] = SERP_API_KEY
    print("Calling SerpAPI...")
    res = requests.get("https://serpapi.com/search.json", params=params, timeout=30)
    print("Status:", res.status_code)
    res.raise_for_status()
    return res.json()

try:
    _serp_request({"q": "what is AI and LLM ", "hl": "en", "gl": "us", "num": 10})
except Exception as e:
    print("Error:", e)
