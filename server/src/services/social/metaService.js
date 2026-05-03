import axios from 'axios';

class MetaService {
    /**
     * Generate Meta (Facebook/Instagram) OAuth URL
     */
    static getOAuthUrl(clientId, redirectUri, state = 'meta_auth') {
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            state: state,
            response_type: 'code',
            // Required scopes for managing pages and instagram accounts
            scope: 'email,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
            config_id: process.env.META_CONFIG_ID || '' // Only needed if using Facebook Login Configuration, otherwise omit or let it be blank
        });

        // if config_id isn't present, we'll remove it so it doesn't break
        if (!params.get('config_id')) {
            params.delete('config_id');
        }

        return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
    }

    /**
     * Exchange code for access token
     */
    static async exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
        try {
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                client_secret: clientSecret,
                code: code
            });

            const response = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`);

            return {
                success: true,
                accessToken: response.data.access_token,
                expiresIn: response.data.expires_in, // typically short-lived
            };
        } catch (error) {
            console.error('Meta token exchange error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to exchange Meta token'
            };
        }
    }

    /**
     * Exchange short-lived token for long-lived token
     */
    static async getLongLivedToken(shortLivedToken, clientId, clientSecret) {
        try {
            const params = new URLSearchParams({
                grant_type: 'fb_exchange_token',
                client_id: clientId,
                client_secret: clientSecret,
                fb_exchange_token: shortLivedToken
            });

            const response = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token?${params.toString()}`);

            return {
                success: true,
                accessToken: response.data.access_token,
                expiresIn: response.data.expires_in, // 60 days
            };
        } catch (error) {
            console.error('Meta long-lived token exchange error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to exchange for long-lived Meta token'
            };
        }
    }

    constructor(accessToken) {
        this.accessToken = accessToken;
        this.client = axios.create({
            baseURL: 'https://graph.facebook.com/v19.0',
            params: {
                access_token: this.accessToken
            }
        });
    }

    /**
     * Get user profile
     */
    async getProfile() {
        try {
            const response = await this.client.get('/me', {
                params: {
                    fields: 'id,name,email,picture'
                }
            });

            return {
                success: true,
                data: {
                    profileId: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    profilePicture: response.data.picture?.data?.url
                }
            };
        } catch (error) {
            console.error('Meta fetch profile error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Meta profile'
            };
        }
    }

    /**
     * Get Facebook Pages managed by user and linked Instagram Accounts
     */
    async getPagesAndInstagramAccounts() {
        try {
            // Get all pages
            const pagesResponse = await this.client.get('/me/accounts', {
                params: {
                    fields: 'id,name,access_token,picture,instagram_business_account{id,username,profile_picture_url}'
                }
            });

            const accounts = [];

            if (pagesResponse.data && pagesResponse.data.data) {
                for (const page of pagesResponse.data.data) {
                    // Add Facebook Page
                    accounts.push({
                        platform: 'facebook',
                        accountId: page.id,
                        name: page.name,
                        accessToken: page.access_token, // Page access token
                        picture: page.picture?.data?.url,
                        type: 'Facebook Page'
                    });

                    // Add linked Instagram Business Account if available
                    if (page.instagram_business_account) {
                        accounts.push({
                            platform: 'instagram',
                            accountId: page.instagram_business_account.id,
                            name: page.instagram_business_account.username || page.name + ' (IG)',
                            accessToken: page.access_token, // IG Graph API uses the linked Page access token
                            picture: page.instagram_business_account.profile_picture_url || page.picture?.data?.url,
                            type: 'Instagram Business Account'
                        });
                    }
                }
            }

            return {
                success: true,
                accounts
            };
        } catch (error) {
            console.error('Meta fetch accounts error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to fetch Meta accounts'
            };
        }
    }

    /**
     * Create a post on a Facebook Page
     */
    async createFacebookPost(pageId, text, mediaUrl = null) {
        try {
            let endpoint = `/${pageId}/feed`;
            let payload = { message: text };

            if (mediaUrl) {
                endpoint = `/${pageId}/photos`;
                payload = { message: text, url: mediaUrl };
            }

            const response = await this.client.post(endpoint, payload);
            return { success: true, postId: response.data.id };
        } catch (error) {
            console.error('Meta createFacebookPost error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to publish to Facebook'
            };
        }
    }

    /**
     * Create a post on an Instagram Business Account
     * Requires mediaUrl (Instagram does not allow text-only posts via API)
     */
    async createInstagramPost(igAccountId, caption, mediaUrl) {
        if (!mediaUrl) {
            return { success: false, error: 'Instagram requires an image or video URL' };
        }
        
        try {
            // Step 1: Create media container
            const containerResponse = await this.client.post(`/${igAccountId}/media`, {
                image_url: mediaUrl,
                caption: caption
            });
            
            const creationId = containerResponse.data.id;
            
            // Step 2: Publish the media container
            const publishResponse = await this.client.post(`/${igAccountId}/media_publish`, {
                creation_id: creationId
            });
            
            return { success: true, postId: publishResponse.data.id };
        } catch (error) {
            console.error('Meta createInstagramPost error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to publish to Instagram'
            };
        }
    }
}

export default MetaService;
