import asyncio
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services.geo_ai_service import generate_geo_faq

async def main():
    print("🚀 Running GEO FAQ Agent Test...")
    print("-----------------------------------")
    topic = "Real Estate Investments in Dubai"
    audience = "International Investors"
    language = "English"
    
    print(f"Topic: {topic}")
    print(f"Audience: {audience}")
    print(f"Language: {language}")
    print("\n⏳ Fetching Google 'People Also Ask' & Generating via Perplexity...\n")
    
    try:
        result = await generate_geo_faq(topic, audience, language)
        
        print("✅ SUCCESS! Here is the JSON output:\n")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(main())
