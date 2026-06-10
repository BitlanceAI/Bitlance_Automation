const axios = require('axios');

class BitlanceAI {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error("BitlanceAI: API Key is required");
    }
    this.apiKey = apiKey;
    this.baseURL = options.baseURL || "https://api.bitlancetechhub.com/api/v1";
    this.maxRetries = options.maxRetries || 3;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: options.timeout || 300000 // default 5 min timeout for gen
    });
  }

  async _request(method, endpoint, data = null) {
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await this.client.request({ method, url: endpoint, data });
        return response.data;
      } catch (error) {
        attempt++;
        if (error.response) {
          // Do not retry client errors like 401, 402, 403, 422
          const status = error.response.status;
          if (status >= 400 && status < 500 && status !== 429) {
            throw new Error(`Bitlance API Error (${status}): ${JSON.stringify(error.response.data)}`);
          }
        }
        if (attempt >= this.maxRetries) {
          throw new Error(`Bitlance API Error: Max retries reached. ${error.message}`);
        }
        // Exponential backoff
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  async generateTopics(industry, mode = "SEO", location = "Global", goal = "Lead Generation") {
    if (!industry) throw new Error("industry is required");
    return this._request('POST', '/topic/generate', { industry, mode, location, goal });
  }

  async generateSEO(params) {
    if (!params.topic && !params.industry) throw new Error("topic or industry is required");
    return this._request('POST', '/seo/generate', params);
  }

  async generateGEO(params) {
    if (!params.topic && !params.industry) throw new Error("topic or industry is required");
    return this._request('POST', '/geo/generate', params);
  }

  async auditContent(content, targetKeyword = null, mode = "SEO") {
    if (!content) throw new Error("content is required");
    return this._request('POST', '/content/audit', { content, target_keyword: targetKeyword, mode });
  }

  async rewriteContent(content, instructions = null, mode = "SEO") {
    if (!content) throw new Error("content is required");
    return this._request('POST', '/content/rewrite', { content, instructions, mode });
  }

  async trackKeyword(article_url, target_keyword, optimization_mode = "SEO") {
    return this._request('POST', '/tracking/keywords', { article_url, target_keyword, optimization_mode });
  }

  async getTrackedKeywords() {
    return this._request('GET', '/tracking/keywords');
  }

  async pollAIVisibility(target_keyword, expected_url) {
    return this._request('POST', '/tracking/ai-visibility/poll', { target_keyword, expected_url });
  }

  async predictTraffic(search_volume, current_position, topic_growth_rate = 1.0) {
    return this._request('POST', '/tracking/predict-traffic', { search_volume, current_position, topic_growth_rate });
  }
}

module.exports = BitlanceAI;
