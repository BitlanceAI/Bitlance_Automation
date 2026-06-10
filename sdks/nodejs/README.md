# Bitlance AI Node.js SDK

The official Node.js SDK for the Bitlance SEO/GEO Content Generation API.

## Installation

```bash
npm install bitlance-ai-sdk
```

## Usage

```javascript
const BitlanceAI = require('bitlance-ai-sdk');

const ai = new BitlanceAI('YOUR_API_KEY');

async function run() {
  try {
    // 1. Generate Topics
    const topics = await ai.generateTopics('Real Estate', 'SEO');
    console.log(topics);

    // 2. Generate SEO Article
    const seoArticle = await ai.generateSEO({
      topic: "How to Invest in Commercial Real Estate in 2026",
      keywords: "commercial real estate, investment tips",
      length: "Long (1500+ words)"
    });
    console.log(seoArticle.title);

    // 3. Generate GEO Article
    const geoArticle = await ai.generateGEO({
      topic: "Enterprise AI Adoption Maturity Model",
    });
    console.log(geoArticle.schema_markup);

    // 4. Audit Content
    const audit = await ai.auditContent("Your content here...", "AI Adoption", "GEO");
    console.log(audit.audit_report);

    // 5. Rewrite Content
    const rewritten = await ai.rewriteContent("Your content here...", "Add more hard statistics", "GEO");
    console.log(rewritten.rewritten_content);

  } catch (error) {
    console.error(error.message);
  }
}

run();
```

## Error Handling
The SDK automatically retries on network failures and 429 Too Many Requests errors using exponential backoff (up to 3 retries). 401 Unauthorized or 402 Payment Required errors are thrown immediately.
