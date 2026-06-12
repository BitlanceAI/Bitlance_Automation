import requests
import os
from dotenv import load_dotenv

load_dotenv('/home/codebloodedsash/automation bitlance/Bitlance_Automation/Ai-agents/.env')

api_key = os.getenv("SERP_API_KEY") or os.getenv("SERPAPI_API_KEY")
topic = "what is the role of technology in the modern military?"
search_data = requests.get("https://serpapi.com/search.json", params={
    "api_key": api_key, "q": topic, "hl": "en", "gl": "us", "num": 5
}, timeout=60).json()

paa_list = search_data.get("related_questions", [])
real_questions = [q.get("question") for q in paa_list if q.get("question")]
print("Questions:", real_questions)
print("Error:", search_data.get("error"))
