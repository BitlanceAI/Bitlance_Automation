import asyncio
import os
from openai import AsyncOpenAI
import requests
from dotenv import load_dotenv

load_dotenv(".env")

async def test():
    print("Testing SerpAPI...")
    try:
        r = requests.get("https://serpapi.com/search.json", params={"q": "test", "api_key": os.getenv("SERPAPI_API_KEY")}, timeout=10)
        print("SerpAPI Status:", r.status_code)
    except Exception as e:
        print("SerpAPI Error:", e)

    print("Testing Perplexity...")
    try:
        client = AsyncOpenAI(api_key=os.getenv("PERPLEXITY_API_KEY"), base_url="https://api.perplexity.ai")
        # Specify a short timeout
        r = await client.chat.completions.create(model="sonar-pro", messages=[{"role":"user","content":"test"}], timeout=10)
        print("Perplexity Output:", r.choices[0].message.content)
    except Exception as e:
        print("Perplexity Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
