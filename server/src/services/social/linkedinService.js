import axios from 'axios';

class LinkedinService {
    constructor(accessToken = null) {
        this.accessToken = accessToken;
        this.apiBase = 'https://api.linkedin.com/v2';
    }

    /**
     * Set the access token for this instance
     * @param {string} token 
     */
    setToken(token) {
        this.accessToken = token;
    }

    /**
     * Get the OAuth authorization URL
     */
    static getOAuthUrl(clientId, redirectUri, scopes = ['openid', 'profile', 'email', 'w_member_social']) {
        const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
        url.searchParams.append('response_type', 'code');
        url.searchParams.append('client_id', clientId);
        url.searchParams.append('redirect_uri', redirectUri);
        url.searchParams.append('state', 'linkedin_connect_' + Date.now());
        url.searchParams.append('scope', scopes.join(' '));
        return url.toString();
    }

    /**
     * Exchange authorization code for an access token
     */
    static async exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
        try {
            const params = new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri
            });

            const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, expires_in } = response.data;
            
            // Calculate expiry date
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

            return {
                success: true,
                accessToken: access_token,
                expiresIn: expires_in,
                expiresAt: expiresAt.toISOString()
            };
        } catch (error) {
            console.error('LinkedIn token exchange error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error_description || error.message
            };
        }
    }

    /**
     * Fetch user's basic profile and email
     */
    async getProfile() {
        if (!this.accessToken) {
            throw new Error('Access token is required');
        }

        try {
            // Use the OpenID Connect userinfo endpoint (modern approach)
            const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            const data = profileResponse.data;
            const profileId = data.sub; // OpenID Connect subject identifier
            const name = data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim();
            const profilePicture = data.picture || null;
            const email = data.email || null;

            return {
                success: true,
                data: {
                    profileId,
                    name,
                    profilePicture,
                    email
                }
            };
        } catch (error) {
            console.error('LinkedIn get profile error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Upload an image or video asset to LinkedIn.
     * Returns { assetUrn, mediaCategory }
     * @param {string} profileId
     * @param {Buffer} fileBuffer
     * @param {string} mimeType  e.g. 'image/jpeg', 'video/mp4'
     * @param {'IMAGE'|'VIDEO'} mediaCategory
     */
    async uploadAsset(profileId, fileBuffer, mimeType, mediaCategory) {
        if (!this.accessToken) throw new Error('Access token is required');

        const recipes = {
            IMAGE: 'urn:li:digitalmediaRecipe:feedshare-image',
            VIDEO: 'urn:li:digitalmediaRecipe:feedshare-video',
        };

        // Step 1 – register upload
        const registerRes = await axios.post(
            `${this.apiBase}/assets?action=registerUpload`,
            {
                registerUploadRequest: {
                    recipes: [recipes[mediaCategory]],
                    owner: `urn:li:person:${profileId}`,
                    serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }]
                }
            },
            { headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' } }
        );

        const { asset, uploadMechanism } = registerRes.data.value;
        const uploadUrl = uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;

        // Step 2 – binary upload
        await axios.put(uploadUrl, fileBuffer, {
            headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': mimeType },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        return { assetUrn: asset, mediaCategory };
    }

    /**
     * Upload a document (PDF) to LinkedIn using the REST Documents API.
     * Returns { assetUrn, mediaCategory: 'DOCUMENT' }
     * @param {string} profileId
     * @param {Buffer} fileBuffer
     */
    async uploadDocument(profileId, fileBuffer) {
        if (!this.accessToken) throw new Error('Access token is required');

        // Try recent versions in descending order until one is accepted
        const versions = ['202602', '202601', '202512', '202509', '202506', '202503'];
        let initRes = null;

        for (const version of versions) {
            try {
                initRes = await axios.post(
                    'https://api.linkedin.com/rest/documents?action=initializeUpload',
                    { initializeUploadRequest: { owner: `urn:li:person:${profileId}` } },
                    {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                            'Content-Type': 'application/json',
                            'X-Restli-Protocol-Version': '2.0.0',
                            'LinkedIn-Version': version,
                        }
                    }
                );
                break; // success — stop trying
            } catch (err) {
                if (err.response?.data?.code === 'NONEXISTENT_VERSION') continue;
                throw err; // real error, stop retrying
            }
        }

        if (!initRes) throw new Error('LinkedIn Documents API: no supported version found. PDF upload unavailable.');

        const { uploadUrl, document } = initRes.data.value;
        console.log('[LinkedIn] Document URN from API:', document);

        // Step 2 – binary upload
        await axios.put(uploadUrl, fileBuffer, {
            headers: { 'Authorization': `Bearer ${this.accessToken}`, 'Content-Type': 'application/octet-stream' },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        return { assetUrn: document, mediaCategory: 'DOCUMENT' };
    }

    /**
     * Create a post on LinkedIn (text-only or with media).
     * @param {string} profileId
     * @param {string} text
     * @param {string} visibility - 'PUBLIC' or 'CONNECTIONS'
     * @param {{ assetUrn: string, mediaCategory: 'IMAGE'|'VIDEO'|'DOCUMENT' }|null} media
     */
    async createPost(profileId, text, visibility = 'PUBLIC', media = null) {
        if (!this.accessToken) {
            throw new Error('Access token is required');
        }

        // Documents must use the newer REST Posts API — UGC Posts does not support DOCUMENT
        if (media?.mediaCategory === 'DOCUMENT') {
            return this._createRestPost(profileId, text, visibility, media);
        }

        const shareContent = {
            shareCommentary: { text },
            shareMediaCategory: media?.mediaCategory ?? 'NONE',
        };

        if (media) {
            shareContent.media = [{
                status: 'READY',
                media: media.assetUrn,
            }];
        }

        const body = {
            author: `urn:li:person:${profileId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: { 'com.linkedin.ugc.ShareContent': shareContent },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': visibility },
        };

        try {
            const response = await axios.post(`${this.apiBase}/ugcPosts`, body, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            });

            return { success: true, postId: response.data.id, data: response.data };
        } catch (error) {
            const raw = error.response?.data?.message || error.response?.data?.errorDetails || error.message || '';
            console.error('LinkedIn create post error:', raw);

            if (raw.includes('duplicate')) {
                return { success: false, error: 'LinkedIn rejected this post as duplicate content. Make a small edit to the text and try again.' };
            }
            if (raw.includes('NOT_ALLOWED') || raw.includes('permission')) {
                return { success: false, error: 'Your LinkedIn token does not have permission to post. Please reconnect your account.' };
            }

            return { success: false, error: raw };
        }
    }

    /**
     * Create a post using the LinkedIn REST Posts API (required for DOCUMENT media).
     * The REST Posts API also handles IMAGE/VIDEO but is only called here for documents.
     */
    async _createRestPost(profileId, text, visibility = 'PUBLIC', media = null) {
        const body = {
            author: `urn:li:person:${profileId}`,
            commentary: text,
            visibility: visibility === 'CONNECTIONS' ? 'CONNECTIONS' : 'PUBLIC',
            distribution: {
                feedDistribution: 'MAIN_FEED',
                targetEntities: [],
                thirdPartyDistributionChannels: []
            },
            lifecycleState: 'PUBLISHED',
            isReshareDisabledByAuthor: false
        };

        if (media?.assetUrn) {
            // Ensure URN has urn:li:document: prefix
            const docId = media.assetUrn.startsWith('urn:li:')
                ? media.assetUrn
                : `urn:li:document:${media.assetUrn}`;
            console.log('[LinkedIn] Posting with document URN:', docId);
            body.content = {
                media: {
                    id: docId,
                    title: media.title || 'Document',
                }
            };
        }

        const versions = ['202602', '202601', '202512', '202509', '202506', '202503'];

        for (const version of versions) {
            try {
                const response = await axios.post(
                    'https://api.linkedin.com/rest/posts',
                    body,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                            'Content-Type': 'application/json',
                            'X-Restli-Protocol-Version': '2.0.0',
                            'LinkedIn-Version': version,
                        }
                    }
                );
                // REST Posts API returns the post URN in the x-restli-id header
                const postId = response.headers['x-restli-id'] || response.data?.id;
                return { success: true, postId, data: response.data };
            } catch (err) {
                if (err.response?.data?.code === 'NONEXISTENT_VERSION') continue;
                const raw = err.response?.data?.message || err.response?.data?.errorDetails || err.message || '';
                console.error('LinkedIn REST post error:', raw);
                if (raw.includes('duplicate')) {
                    return { success: false, error: 'LinkedIn rejected this post as duplicate content. Make a small edit to the text and try again.' };
                }
                return { success: false, error: raw };
            }
        }

        return { success: false, error: 'LinkedIn REST Posts API: no supported version found.' };
    }

    /**
     * Check if token is valid without making big calls (or just fetch profile)
     */
    async validateToken() {
        if (!this.accessToken) return { isValid: false };
        try {
            const profile = await this.getProfile();
            return {
                isValid: profile.success,
                success: profile.success
            };
        } catch (error) {
            return { isValid: false, success: false, error: error.message };
        }
    }
}

export default LinkedinService;
