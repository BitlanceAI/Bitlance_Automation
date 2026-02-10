/**
 * Meta Graph API Service
 * Handles all interactions with Meta's Graph API and Marketing API
 */

import axios from 'axios';

const META_API_VERSION = process.env.META_API_VERSION || 'v18.0';
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

class MetaService {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.client = axios.create({
            baseURL: META_GRAPH_URL,
            timeout: 30000,
        });
    }

    /**
     * Make authenticated API request
     */
    async request(method, endpoint, data = {}, params = {}) {
        try {
            const config = {
                method,
                url: endpoint,
                params: {
                    access_token: this.accessToken,
                    ...params
                }
            };

            if (method === 'POST' || method === 'PUT') {
                config.data = data;
            }

            const response = await this.client.request(config);
            return { success: true, data: response.data };
        } catch (error) {
            console.error(`Meta API Error [${endpoint}]:`, error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message,
                code: error.response?.data?.error?.code
            };
        }
    }

    // ==================== ACCOUNT METHODS ====================

    /**
     * Get current user profile
     */
    async getMe() {
        return this.request('GET', '/me', {}, {
            fields: 'id,name,email,picture'
        });
    }

    /**
     * Get user's Facebook Pages
     */
    async getPages() {
        const result = await this.request('GET', '/me/accounts', {}, {
            fields: 'id,name,access_token,category,picture,fan_count,instagram_business_account'
        });

        if (result.success && result.data.data) {
            return { success: true, pages: result.data.data };
        }
        return result;
    }

    /**
     * Get user's Ad Accounts
     */
    async getAdAccounts() {
        const result = await this.request('GET', '/me/adaccounts', {}, {
            fields: 'id,account_id,name,account_status,currency,amount_spent,balance'
        });

        if (result.success && result.data.data) {
            return { success: true, adAccounts: result.data.data };
        }
        return result;
    }

    /**
     * Validate access token
     */
    async validateToken() {
        const result = await this.request('GET', '/debug_token', {}, {
            input_token: this.accessToken
        });

        if (result.success && result.data.data) {
            return {
                success: true,
                isValid: result.data.data.is_valid,
                expiresAt: result.data.data.expires_at ? new Date(result.data.data.expires_at * 1000) : null,
                scopes: result.data.data.scopes || []
            };
        }
        return { success: false, isValid: false };
    }

    // ==================== PAGE POST METHODS ====================

    /**
     * Publish a post to a Facebook Page
     */
    async publishPost(pageId, pageAccessToken, { message, link, mediaUrls }) {
        const service = new MetaService(pageAccessToken);

        const postData = { message };
        if (link) postData.link = link;

        // If there are media URLs, we need to handle photo/video uploads
        if (mediaUrls && mediaUrls.length > 0) {
            // For single image
            if (mediaUrls.length === 1) {
                return service.request('POST', `/${pageId}/photos`, {
                    caption: message,
                    url: mediaUrls[0]
                });
            }
            // For multiple images (TODO: implement carousel)
        }

        return service.request('POST', `/${pageId}/feed`, postData);
    }

    /**
     * Schedule a post to a Facebook Page
     */
    async schedulePost(pageId, pageAccessToken, { message, link, scheduledTime }) {
        const service = new MetaService(pageAccessToken);

        const postData = {
            message,
            published: false,
            scheduled_publish_time: Math.floor(new Date(scheduledTime).getTime() / 1000)
        };
        if (link) postData.link = link;

        return service.request('POST', `/${pageId}/feed`, postData);
    }

    /**
     * Get scheduled posts for a page
     */
    async getScheduledPosts(pageId, pageAccessToken) {
        const service = new MetaService(pageAccessToken);
        return service.request('GET', `/${pageId}/scheduled_posts`, {}, {
            fields: 'id,message,scheduled_publish_time,created_time'
        });
    }

    // ==================== CAMPAIGN METHODS ====================

    /**
     * Get campaigns for an ad account
     */
    async getCampaigns(adAccountId) {
        return this.request('GET', `/act_${adAccountId}/campaigns`, {}, {
            fields: 'id,name,status,objective,created_time,updated_time,daily_budget,lifetime_budget,budget_remaining',
            limit: 50
        });
    }

    /**
     * Get campaign insights
     */
    async getCampaignInsights(campaignId, datePreset = 'last_30d') {
        return this.request('GET', `/${campaignId}/insights`, {}, {
            fields: 'impressions,clicks,spend,reach,cpc,ctr,conversions,cost_per_conversion',
            date_preset: datePreset
        });
    }

    /**
     * Get ad account insights (aggregated)
     */
    async getAdAccountInsights(adAccountId, datePreset = 'last_30d') {
        return this.request('GET', `/act_${adAccountId}/insights`, {}, {
            fields: 'impressions,clicks,spend,reach,cpc,ctr,conversions,cost_per_conversion',
            date_preset: datePreset
        });
    }

    /**
     * Create a campaign
     */
    async createCampaign(adAccountId, { name, objective, status = 'PAUSED', dailyBudget }) {
        const campaignData = {
            name,
            objective, // OUTCOME_TRAFFIC, OUTCOME_ENGAGEMENT, OUTCOME_LEADS, etc.
            status,
            special_ad_categories: [] // Required field
        };

        return this.request('POST', `/act_${adAccountId}/campaigns`, campaignData);
    }

    async updateCampaignStatus(campaignId, status) {
        return this.request('POST', `/${campaignId}`, { status });
    }

    // ==================== CONVERSION API METHODS ====================

    /**
     * Send Event to Meta Conversion API
     * @param {string} pixelId - The Meta Pixel ID
     * @param {Array} events - Array of event objects
     * @param {string|null} testCode - Optional test code for Graph API Test Tool
     */
    async sendConversionEvent(pixelId, events, testCode = null) {
        const payload = {
            data: events,
            // partner_agent: 'plbitlance' // Optional: if we were a platform partner
        };

        if (testCode) {
            payload.test_event_code = testCode;
        }

        console.log(`Sending ${events.length} events to CAPI (Pixel: ${pixelId})`, JSON.stringify(payload, null, 2));

        return this.request('POST', `/${pixelId}/events`, payload);
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Exchange short-lived token for long-lived token
     */
    static async exchangeToken(shortLivedToken, appId, appSecret) {
        try {
            const response = await axios.get(`${META_GRAPH_URL}/oauth/access_token`, {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: appId,
                    client_secret: appSecret,
                    fb_exchange_token: shortLivedToken
                }
            });

            return {
                success: true,
                accessToken: response.data.access_token,
                expiresIn: response.data.expires_in
            };
        } catch (error) {
            console.error('Token exchange error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    /**
     * Generate OAuth authorization URL
     */
    static getOAuthUrl(appId, redirectUri, scope) {
        const scopes = scope || [
            'pages_manage_posts',
            'pages_read_engagement',
            'pages_show_list',
            'ads_management',
            'ads_read',
            'business_management',
            'instagram_basic',
            'instagram_content_publish'
        ];

        const params = new URLSearchParams({
            client_id: appId,
            redirect_uri: redirectUri,
            scope: scopes.join(','),
            response_type: 'code',
            state: generateState()
        });

        return `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?${params.toString()}`;
    }

    /**
     * Exchange OAuth code for access token
     */
    static async exchangeCodeForToken(code, appId, appSecret, redirectUri) {
        try {
            const response = await axios.get(`${META_GRAPH_URL}/oauth/access_token`, {
                params: {
                    client_id: appId,
                    client_secret: appSecret,
                    redirect_uri: redirectUri,
                    code
                }
            });

            return {
                success: true,
                accessToken: response.data.access_token,
                expiresIn: response.data.expires_in
            };
        } catch (error) {
            console.error('OAuth code exchange error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message
            };
        }
    }
}

/**
 * Generate random state for OAuth CSRF protection
 */
function generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default MetaService;
export { MetaService, META_API_VERSION, META_GRAPH_URL };
