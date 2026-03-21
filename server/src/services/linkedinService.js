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
