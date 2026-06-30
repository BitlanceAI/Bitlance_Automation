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
            scope: 'email,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,instagram_manage_comments,pages_messaging',
            config_id: process.env.META_CONFIG_ID || ''
        });

        if (!params.get('config_id')) {
            params.delete('config_id');
        }

        return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
    }

    // Instagram Business Login — separate app, no Facebook required
    static getInstagramOAuthUrl(redirectUri, state = 'ig_auth') {
        const params = new URLSearchParams({
            client_id: process.env.INSTAGRAM_APP_ID,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish',
            state: state
        });
        return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
    }

    static async exchangeInstagramCodeForToken(code, redirectUri) {
        const params = new URLSearchParams({
            client_id: process.env.INSTAGRAM_APP_ID,
            client_secret: process.env.INSTAGRAM_APP_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code
        });
        const response = await axios.post('https://api.instagram.com/oauth/access_token', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data; // { access_token, user_id }
    }

    static async getInstagramLongLivedToken(shortToken) {
        // Try versioned endpoint first, then unversioned fallback
        const urls = [
            'https://graph.instagram.com/access_token',
            'https://graph.instagram.com/v21.0/access_token'
        ];
        let lastError;
        for (const url of urls) {
            try {
                const response = await axios.get(url, {
                    params: {
                        grant_type: 'ig_exchange_token',
                        client_secret: process.env.INSTAGRAM_APP_SECRET,
                        access_token: shortToken
                    }
                });
                return response.data; // { access_token, token_type, expires_in }
            } catch (err) {
                lastError = err;
                console.warn(`[MetaService] Long-lived token GET ${url} failed:`, err.response?.data?.error?.message || err.message);
            }
        }
        throw lastError;
    }

    static async getInstagramProfile(accessToken, userId = null) {
        // Instagram Business Login API: use /{user_id} or /me
        const endpoints = userId
            ? [`https://graph.instagram.com/v21.0/${userId}`, `https://graph.instagram.com/${userId}`, 'https://graph.instagram.com/v21.0/me', 'https://graph.instagram.com/me']
            : ['https://graph.instagram.com/v21.0/me', 'https://graph.instagram.com/me'];
        
        const fieldSets = [
            'user_id,username,name,account_type,profile_picture_url,followers_count,media_count',
            'user_id,username,profile_picture_url,account_type',
            'username,profile_picture_url'
        ];

        let lastError;
        for (const url of endpoints) {
            for (const fields of fieldSets) {
                try {
                    const response = await axios.get(url, {
                        params: { fields, access_token: accessToken }
                    });
                    console.log(`[MetaService] IG profile fetched from ${url} with fields: ${fields}`);
                    return response.data;
                } catch (err) {
                    lastError = err;
                }
            }
        }
        console.warn('[MetaService] All IG profile endpoints failed:', lastError?.response?.data?.error?.message || lastError?.message);
        throw lastError;
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

    /**
     * Get recent Instagram media (posts) for an IG account
     */
    async getInstagramMedia(igAccountId, limit = 20) {
        try {
            const response = await this.client.get(`/${igAccountId}/media`, {
                params: {
                    fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count',
                    limit
                }
            });
            return { success: true, media: response.data.data || [] };
        } catch (error) {
            console.error('Meta getInstagramMedia error:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error?.message || 'Failed to fetch media' };
        }
    }

    /**
     * Get comments for an Instagram media post
     */
    async getComments(igMediaId, limit = 50) {
        try {
            const response = await this.client.get(`/${igMediaId}/comments`, {
                params: {
                    fields: 'id,text,username,timestamp,replies{id,text,username,timestamp}',
                    limit
                }
            });
            return { success: true, comments: response.data.data || [] };
        } catch (error) {
            console.error('Meta getComments error:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error?.message || 'Failed to fetch comments' };
        }
    }

    /**
     * Reply to an Instagram comment
     */
    async replyToComment(commentId, message) {
        try {
            const response = await this.client.post(`/${commentId}/replies`, { message });
            return { success: true, replyId: response.data.id };
        } catch (error) {
            console.error('Meta replyToComment error:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error?.message || 'Failed to reply to comment' };
        }
    }

    /**
     * Hide or unhide a comment
     */
    async moderateComment(commentId, hide = true) {
        try {
            await this.client.post(`/${commentId}`, { is_hidden: hide });
            return { success: true };
        } catch (error) {
            console.error('Meta moderateComment error:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error?.message || 'Failed to moderate comment' };
        }
    }

    /**
     * Get Facebook Page conversations (DMs/inbox)
     */
    async getPageConversations(pageId, limit = 20) {
        try {
            const response = await this.client.get(`/${pageId}/conversations`, {
                params: {
                    fields: 'participants,messages{message,from,created_time},updated_time',
                    limit
                }
            });
            const conversations = (response.data.data || []).map(conv => {
                const msgs = conv.messages?.data || [];
                const participants = conv.participants?.data || [];
                const other = participants.find(p => p.id !== pageId) || participants[0] || {};
                return {
                    id: conv.id,
                    name: other.name || 'Unknown',
                    handle: other.email || '',
                    time: conv.updated_time,
                    lastMessage: msgs[0]?.message || '',
                    messages: msgs.map(m => ({
                        id: m.id || `${conv.id}-${m.created_time}`,
                        from: m.from?.id === pageId ? 'me' : 'them',
                        text: m.message,
                        time: m.created_time
                    })).reverse(),
                    platform: 'facebook',
                    unread: 0
                };
            });
            return { success: true, conversations };
        } catch (error) {
            console.error('Meta getPageConversations error:', error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error?.message || 'Failed to fetch conversations' };
        }
    }
}

export default MetaService;
