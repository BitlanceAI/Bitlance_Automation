import requests
print("testing")
try:
    resp = requests.get("https://serpapi.com/search.json", params={"engine": "google_trends_autocomplete", "q": "what is AI", "api_key": "dummy"}, timeout=10)
    print(resp.status_code)
except Exception as e:
    print(f"Error: {e}")
