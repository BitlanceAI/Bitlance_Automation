import requests
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

headers = {
    "Authorization": f"Bearer {OPENAI_API_KEY}",
    "Content-Type": "application/json",
}
payload = {
    "model": "dall-e-3",
    "prompt": "Test prompt",
    "n": 1,
    "size": "1024x1024"
}
try:
    res = requests.post("https://api.openai.com/v1/images/generations", headers=headers, json=payload)
    print("Status Code:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print(e)
