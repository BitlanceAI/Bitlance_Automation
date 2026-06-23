const axios = require('axios');

// ─────────────────────────────────────────────────────────────────────────────
// Custom Error class — lets callers check error.code and error.creditsRemaining
// ─────────────────────────────────────────────────────────────────────────────
class BitlanceAIError extends Error {
  constructor(message, statusCode = null, body = null) {
    super(message);
    this.name = 'BitlanceAIError';
    this.statusCode = statusCode;
    this.code = body?.code || null;
    this.creditsRemaining = body?.credits_remaining ?? null;
    this.requiredCredits = body?.required_credits ?? null;
    this.pricingUrl = body?.pricing_url || null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BitlanceAI — main client
// ─────────────────────────────────────────────────────────────────────────────
class BitlanceAI {
  /**
   * @param {string} apiKey  - Your sk_live_* API key from the Bitlance dashboard
   * @param {object} options
   * @param {string} [options.baseURL]    - Override API base (default: https://api.bitlancetechhub.com/api/v1)
   * @param {number} [options.timeout]    - Request timeout in ms (default: 300000)
   * @param {number} [options.maxRetries] - Retry count on network/5xx/429 errors (default: 3)
   */
  constructor(apiKey, options = {}) {
    if (!apiKey) throw new BitlanceAIError('BitlanceAI: apiKey is required');

    this.apiKey = apiKey;
    this.baseURL = options.baseURL || 'https://api.bitlancetechhub.com/api/v1';
    this.maxRetries = options.maxRetries || 3;

    this._http = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: options.timeout || 300000, // 5-minute default for generation
    });
  }

  // ── Internal request helper with retry + backoff ──────────────────────────
  async _request(method, endpoint, data = null) {
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const res = await this._http.request({ method, url: endpoint, data });
        return res.data;
      } catch (err) {
        attempt++;
        if (err.response) {
          const status = err.response.status;
          const body = err.response.data || {};

          // Structured 402 — expose credit info directly
          if (status === 402 && body.code === 'INSUFFICIENT_CREDITS') {
            throw new BitlanceAIError(
              `Insufficient credits. You have ${body.credits_remaining} credits but need ${body.required_credits}. Top up at: ${body.pricing_url}`,
              402,
              body
            );
          }

          // Other 4xx — don't retry
          if (status >= 400 && status < 500 && status !== 429) {
            throw new BitlanceAIError(
              `Bitlance API Error (${status}): ${JSON.stringify(body)}`,
              status,
              body
            );
          }
        }

        if (attempt >= this.maxRetries) {
          throw new BitlanceAIError(`Bitlance API Error: Max retries reached. ${err.message}`);
        }
        // Exponential backoff: 2s, 4s, 8s…
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  // ── Blog Generation ───────────────────────────────────────────────────────

  /**
   * Generate an SEO-optimized blog article
   * @param {object} params
   * @param {string} params.topic          - Blog topic (required)
   * @param {string} [params.keywords]     - Target keywords
   * @param {string} [params.industry]     - Industry context
   * @param {string} [params.length]       - "Short", "Medium", "Long (1500+ words)"
   * @param {string} [params.language]     - Default "English"
   * @param {object} [params.brand_context_data] - { company_name, additional_info }
   * @returns {Promise<{success, article, markdown, seoTitle, imageUrl, wordCount, keywords}>}
   */
  async generateSEO(params) {
    if (!params.topic && !params.industry) throw new BitlanceAIError('topic or industry is required');
    return this._request('POST', '/seo/generate', {
      ...params,
      optimization_mode: 'SEO',
    });
  }

  /**
   * Generate a GEO-optimized blog (for AI search engines like ChatGPT, Perplexity)
   * @param {object} params  - Same shape as generateSEO
   * @returns {Promise<{success, article, markdown, seoTitle, imageUrl, wordCount}>}
   */
  async generateGEO(params) {
    if (!params.topic && !params.industry) throw new BitlanceAIError('topic or industry is required');
    return this._request('POST', '/geo/generate', {
      ...params,
      optimization_mode: 'GEO',
    });
  }

  // ── Topic Research ────────────────────────────────────────────────────────

  /**
   * Get AI-scored topic suggestions for a given industry
   * @param {string} industry
   * @param {string} [mode]     - "SEO" or "GEO" (default: "SEO")
   * @param {string} [location] - Target location (default: "Global")
   * @param {string} [goal]     - Business goal (default: "Lead Generation")
   * @returns {Promise<{industry, topics: Array}>}
   */
  async generateTopics(industry, mode = 'SEO', location = 'Global', goal = 'Lead Generation') {
    if (!industry) throw new BitlanceAIError('industry is required');
    return this._request('POST', '/topic/generate', { industry, mode, location, goal });
  }

  // ── Content Tools ─────────────────────────────────────────────────────────

  /**
   * Run SEO/GEO/EEAT audit on existing content
   * @param {string} content
   * @param {string} [targetKeyword]
   * @param {string} [mode]  - "SEO" or "GEO"
   */
  async auditContent(content, targetKeyword = null, mode = 'SEO') {
    if (!content) throw new BitlanceAIError('content is required');
    return this._request('POST', '/content/audit', { content, target_keyword: targetKeyword, mode });
  }

  /**
   * Rewrite and improve existing content
   * @param {string} content
   * @param {string} [instructions] - Specific improvement instructions
   * @param {string} [mode]
   */
  async rewriteContent(content, instructions = null, mode = 'SEO') {
    if (!content) throw new BitlanceAIError('content is required');
    return this._request('POST', '/content/rewrite', { content, instructions, mode });
  }
}

module.exports = BitlanceAI;
module.exports.BitlanceAIError = BitlanceAIError;
