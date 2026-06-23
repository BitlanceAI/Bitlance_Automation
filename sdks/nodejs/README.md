# bitlance-ai-sdk (Node.js)

Official Node.js SDK for the [Bitlance](https://app.bitlance.ai) SEO/GEO AI Content Generation API.

## Installation

```bash
npm install bitlance-ai-sdk
```

## Quick Start

```javascript
const BitlanceAI = require('bitlance-ai-sdk');

const ai = new BitlanceAI('sk_live_YOUR_API_KEY');

// Generate a full SEO blog article
const result = await ai.generateSEO({
  topic: 'Top 10 EdTech Trends in 2026',
  keywords: 'edtech, online learning, LMS',
  industry: 'Education',
  length: 'Long (1500+ words)',
  brand_context_data: {
    company_name: 'Lotlite Edu',
    additional_info: 'We offer 1-on-1 mentorship with 50,000+ students.'
  }
});

console.log(result.article);    // Full HTML blog
console.log(result.seoTitle);   // SEO-optimised title
console.log(result.imageUrl);   // AI-generated featured image
console.log(result.wordCount);  // e.g. 1842
```

## Methods

### `generateSEO(params)` — Google search-optimised blog
### `generateGEO(params)` — AI search (ChatGPT / Perplexity) optimised blog

Both accept the same params object:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | ✅ | The blog topic |
| `keywords` | string | ❌ | Target keywords (comma-separated) |
| `industry` | string | ❌ | Industry for context |
| `length` | string | ❌ | `"Short"`, `"Medium"`, `"Long (1500+ words)"` |
| `language` | string | ❌ | Default: `"English"` |
| `brand_context_data` | object | ❌ | `{ company_name, additional_info }` |

### `generateTopics(industry, mode, location, goal)` — Get topic suggestions

```javascript
const topics = await ai.generateTopics('Real Estate', 'SEO', 'Mumbai', 'Lead Generation');
```

### `auditContent(content, targetKeyword, mode)` — SEO/GEO/EEAT content audit

### `rewriteContent(content, instructions, mode)` — Rewrite and improve content

## Error Handling

```javascript
const { BitlanceAIError } = require('bitlance-ai-sdk');

try {
  const result = await ai.generateSEO({ topic: 'AI in Healthcare' });
} catch (err) {
  if (err instanceof BitlanceAIError) {
    if (err.code === 'INSUFFICIENT_CREDITS') {
      console.log(`Credits remaining: ${err.creditsRemaining}`);
      console.log(`Credits needed:    ${err.requiredCredits}`);
      console.log(`Top up at:         ${err.pricingUrl}`);
    } else if (err.statusCode === 401) {
      console.log('Invalid API key');
    } else if (err.statusCode === 429) {
      console.log('Rate limit hit — SDK will auto-retry with backoff');
    }
  }
}
```

The SDK automatically retries on network failures, 5xx errors, and `429 Too Many Requests` using exponential backoff (up to 3 retries by default).

## Constructor Options

```javascript
const ai = new BitlanceAI('sk_live_...', {
  timeout: 300000,    // ms — default 5 min (generation takes 30-90 seconds)
  maxRetries: 3,      // retry count on network/server errors
  baseURL: 'https://api.bitlancetechhub.com/api/v1'  // override if self-hosted
});
```

## License

MIT © [Bitlance Automation](https://app.bitlance.ai)
