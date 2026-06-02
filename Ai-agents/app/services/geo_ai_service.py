import os
import json
import asyncio
from openai import AsyncOpenAI
from app.services.serp_tools import _serp_request

async def generate_geo_faq(topic: str, audience: str, language: str):
    """
    Generates a Generative Engine Optimized (GEO) FAQ section for a given topic.
    Returns a structured Q&A JSON designed to be cited by AI search engines.
    """
    
    # 1. Scrape real-time Google 'People Also Ask' using SerpAPI
    try:
        def fetch_paa():
            import requests
            api_key = os.getenv("SERP_API_KEY") or os.getenv("SERPAPI_API_KEY")
            if not api_key:
                return {}
            # Strict 5-second timeout to prevent hanging the API
            return requests.get("https://serpapi.com/search.json", params={
                "api_key": api_key,
                "q": topic,
                "hl": "en",
                "gl": "us",
                "num": 5
            }, timeout=5).json()
            
        search_data = await asyncio.to_thread(fetch_paa)
        paa_list = search_data.get("related_questions", [])
        real_questions = [q.get("question") for q in paa_list if q.get("question")]
    except Exception as e:
        print(f"Warning: SerpAPI scraping failed for GEO FAQ: {e}")
        real_questions = []

    paa_context = ""
    if real_questions:
        paa_context = "\nCURRENT GOOGLE 'PEOPLE ALSO ASK' (Must include and answer these):\n"
        for q in real_questions[:5]:
            paa_context += f"- {q}\n"

    # Use Perplexity for GEO since it accesses real-time internet search!
    client = AsyncOpenAI(
        api_key=os.getenv('PERPLEXITY_API_KEY') or os.getenv('OPENAI_API_KEY'),
        base_url="https://api.perplexity.ai" if os.getenv('PERPLEXITY_API_KEY') else "https://api.openai.com/v1"
    )
    
    model_name = "sonar-pro" if os.getenv('PERPLEXITY_API_KEY') else "gpt-4o-mini"
    
    prompt = f"""You are a Generative Engine Optimization (GEO) Expert and an advanced web researcher.
Your goal is to generate a highly authoritative, comprehensive FAQ-based blog post about "{topic}".
AI search engines prioritize content that directly, concisely, and factually answers real user questions, but human readers also appreciate an engaging introduction and conclusion.

Target Audience: {audience}
Language: {language}
{paa_context}

INSTRUCTIONS:
1. Identify 5 high-intent questions people actually ask about "{topic}". If "CURRENT GOOGLE 'PEOPLE ALSO ASK'" is provided above, you MUST prioritize those exact questions.
2. For each answer, start with a direct, definitive, "bottom-line-up-front" (BLUF) sentence.
3. Use HTML formatting in the answer: include <ul>, <li>, and <strong> where applicable.
4. Keep the tone professional, objective, and factual.
5. Identify 3 core "Entities" or "Keywords" related to the topic.
6. CRITICAL: Your entire response must be a single, perfectly valid JSON object. Ensure all double quotes are properly escaped. Do NOT use any raw unescaped backslashes (\). 

Return the result as a valid JSON object matching this exact structure:
{{
    "topic": "{topic}",
    "seo_title": "A highly clickable, SEO-optimized title for this blog post",
    "meta_description": "A concise, compelling meta description (under 160 characters)",
    "target_entities": ["entity1", "entity2", "entity3"],
    "introduction": "A compelling, SEO-optimized 2-paragraph introduction for the blog post (use HTML <p> tags).",
    "faqs": [
        {{
            "question": "The specific user question",
            "answer": "The highly optimized HTML formatted answer (use <p>, <ul>, <li>, <strong>).",
            "intent": "informational | navigational | transactional | commercial"
        }}
    ],
    "conclusion": "A strong concluding paragraph summarizing the blog post and providing a call to action (use HTML <p> tags)."
}}
"""

    try:
        print(f"[GEO] Requesting Perplexity for topic: {topic}")
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are a GEO and technical SEO expert. Return ONLY a valid JSON object. Do not include markdown code blocks or any other text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        content = response.choices[0].message.content
        print(f"[GEO] Perplexity response received. Length: {len(content)}")
        
        # Strip potential markdown formatting if returned
        if content.startswith("```json"):
            content = content.replace("```json\n", "").replace("\n```", "")
        
        return json.loads(content)
        
    except Exception as e:
        print(f"[GEO] ERROR in generation: {e}")
        raise Exception(f"Failed to generate GEO FAQ: {str(e)}")
