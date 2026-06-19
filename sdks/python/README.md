# bitlance-ai-sdk (Python)

Official Python SDK for the [Bitlance](https://app.bitlance.ai) SEO/GEO AI Content Generation API.

## Installation

```bash
pip install bitlance-ai-sdk
```

## Quick Start

```python
from bitlance_ai import BitlanceAI

ai = BitlanceAI("sk_live_YOUR_API_KEY")

# Generate a full SEO blog article
result = ai.generate_seo(
    topic="Top 10 EdTech Trends in 2026",
    keywords="edtech, online learning, LMS",
    industry="Education",
    length="Long (1500+ words)",
    brand_context_data={
        "company_name": "Lotlite Edu",
        "additional_info": "We offer 1-on-1 mentorship with 50,000+ students."
    }
)

print(result["article"])    # Full HTML blog
print(result["seoTitle"])   # SEO-optimised title
print(result["imageUrl"])   # AI-generated featured image
print(result["wordCount"])  # e.g. 1842
```

## Methods

### `generate_seo(topic, **kwargs)` — Google search-optimised blog
### `generate_geo(topic, **kwargs)` — AI search (ChatGPT / Perplexity) optimised blog

Both accept the same keyword arguments:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | str | ✅ | The blog topic |
| `keywords` | str | ❌ | Target keywords (comma-separated) |
| `industry` | str | ❌ | Industry for context |
| `length` | str | ❌ | `"Short"`, `"Medium"`, `"Long (1500+ words)"` |
| `language` | str | ❌ | Default: `"English"` |
| `brand_context_data` | dict | ❌ | `{"company_name": ..., "additional_info": ...}` |

### `generate_topics(industry, mode, location, goal)` — Topic suggestions

```python
topics = ai.generate_topics("Real Estate", mode="SEO", location="Mumbai")
for t in topics["topics"]:
    print(t["topic"], t["traffic_score"])
```

### `audit_content(content, target_keyword, mode)` — SEO/GEO/EEAT audit
### `rewrite_content(content, instructions, mode)` — Rewrite and improve content

## Error Handling

```python
from bitlance_ai import BitlanceAI, BitlanceAIError

ai = BitlanceAI("sk_live_YOUR_API_KEY")

try:
    result = ai.generate_seo(topic="AI in Healthcare")
except BitlanceAIError as e:
    if e.code == "INSUFFICIENT_CREDITS":
        print(f"Credits remaining : {e.credits_remaining}")
        print(f"Credits needed    : {e.required_credits}")
        print(f"Top up at         : {e.pricing_url}")
    elif e.status_code == 401:
        print("Invalid API key")
    elif e.status_code == 429:
        print("Rate limit hit — SDK will auto-retry with backoff")
    else:
        print(f"API Error: {e}")
```

The SDK automatically retries on network failures, 5xx errors, and `429 Too Many Requests` using exponential backoff (up to 3 retries by default).

## Constructor Options

```python
ai = BitlanceAI(
    api_key="sk_live_...",
    timeout=300,      # seconds — default 5 min (generation takes 30-90 seconds)
    max_retries=3,    # retry count on network/server errors
    base_url="https://api.bitlancetechhub.com/api/v1"  # override if self-hosted
)
```

## License

MIT © [Bitlance Automation](https://app.bitlance.ai)
