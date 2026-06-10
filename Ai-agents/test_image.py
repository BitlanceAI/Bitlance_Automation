import requests
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

headers = {
    "Authorization": f"Bearer {OPENAI_API_KEY}",
    "Content-Type": "application/json",
}
payload = {
    "model": "gpt-image-2",
    "prompt": "Test prompt",
    "n": 1,
    "size": "256x256"
}
try:
    res = requests.post("https://api.openai.com/v1/images/generations", headers=headers, json=payload)
    print("Status Code:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print(e)
