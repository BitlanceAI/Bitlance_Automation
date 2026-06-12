# Bitlance AI Python SDK

The official Python SDK for the Bitlance SEO/GEO Content Generation API.

## Installation

```bash
pip install bitlance-ai-sdk
```

## Usage

```python
from bitlance_ai import BitlanceAI

ai = BitlanceAI(api_key="YOUR_API_KEY")

def main():
    try:
        # 1. Generate Topics
        topics = ai.generate_topics(industry="Real Estate", mode="SEO")
        print("Topics:", topics)

        # 2. Generate SEO Article
        seo_article = ai.generate_seo({
            "topic": "How to Invest in Commercial Real Estate in 2026",
            "keywords": "commercial real estate, investment tips",
            "length": "Long (1500+ words)"
        })
        print("Title:", seo_article.get("title"))

        # 3. Generate GEO Article
        geo_article = ai.generate_geo({
            "topic": "Enterprise AI Adoption Maturity Model",
        })
        print("Schema:", geo_article.get("schema_markup"))

        # 4. Audit Content
        audit = ai.audit_content("Your content here...", target_keyword="AI Adoption", mode="GEO")
        print("Audit:", audit.get("audit_report"))

        # 5. Rewrite Content
        rewritten = ai.rewrite_content("Your content here...", instructions="Add more hard statistics", mode="GEO")
        print("Rewritten:", rewritten.get("rewritten_content"))

    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    main()
```

## Error Handling
The SDK automatically retries on network failures and `429 Too Many Requests` errors using exponential backoff (up to 3 retries). Client errors like `401 Unauthorized` or `402 Payment Required` will immediately raise a `BitlanceAIError`.
