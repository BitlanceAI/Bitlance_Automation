import express from 'express';
import { createClient } from '@supabase/supabase-js';
import LinkedinService from '../services/linkedinService.js';
import { encryptData, decryptData } from '../../utils/encryption.js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
// The redirect URI must precisely match what you configure in the LinkedIn App portal.
// Best approach: redirect to the frontend directly, so the frontend can read the 'code' parameter, and pass it securely to the api.
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5173/dashboard';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

router.use(authMiddleware);

/**
 * Get OAuth authorization URL
 * GET /api/linkedin/oauth/url
 */
router.get('/oauth/url', (req, res) => {
    if (!LINKEDIN_CLIENT_ID) {
        return res.status(500).json({ error: 'LinkedIn Client ID not configured' });
    }
    const authUrl = LinkedinService.getOAuthUrl(LINKEDIN_CLIENT_ID, LINKEDIN_REDIRECT_URI);
    res.json({ success: true, url: authUrl });
});

/**
 * Exchange code for token and save profile
 * POST /api/linkedin/connect
 */
router.post('/connect', async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        // Exchange code for token
        const tokenResult = await LinkedinService.exchangeCodeForToken(
            code,
            LINKEDIN_CLIENT_ID,
            LINKEDIN_CLIENT_SECRET,
            LINKEDIN_REDIRECT_URI
        );

        if (!tokenResult.success) {
            return res.status(400).json({ error: tokenResult.error });
        }

        // Fetch user profile
        const linkedinService = new LinkedinService(tokenResult.accessToken);
        const profileResult = await linkedinService.getProfile();

        if (!profileResult.success) {
            return res.status(400).json({ error: 'Failed to fetch LinkedIn profile' });
        }

        const profile = profileResult.data;

        // Encrypt token
        let encryptedToken;
        try {
            encryptedToken = encryptData(tokenResult.accessToken);
        } catch (encError) {
            console.error('LinkedIn encryption error:', encError);
            return res.status(500).json({ error: 'Encryption configuration error' });
        }

        // Store in database
        const { data: connection, error } = await supabase
            .from('linkedin_connections')
            .upsert({
                user_id: userId,
                profile_id: profile.profileId,
                profile_name: profile.name,
                profile_picture: profile.profilePicture,
                email: profile.email,
                access_token: encryptedToken,
                token_expires_at: tokenResult.expiresAt,
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id, profile_id'
            })
            .select()
            .single();

        if (error) {
            console.error('LinkedIn database error:', error);
            throw error;
        }

        res.json({
            success: true,
            message: 'LinkedIn account connected successfully',
            profile: profile
        });

    } catch (error) {
        console.error('LinkedIn connect error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get current active LinkedIn connection
 * GET /api/linkedin/connection
 */
router.get('/connection', async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: connections, error } = await supabase
            .from('linkedin_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw error;
        
        if (!connections || connections.length === 0) {
            return res.json({ connected: false, profiles: [] });
        }

        // Format to exclude token and return safe profile info
        const safeProfiles = connections.map(conn => ({
            id: conn.id,
            profileId: conn.profile_id,
            name: conn.profile_name,
            profilePicture: conn.profile_picture,
            email: conn.email,
            expiresAt: conn.token_expires_at
        }));

        res.json({
            connected: true,
            profiles: safeProfiles
        });
    } catch (error) {
        console.error('Get LinkedIn connection error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Disconnect a LinkedIn account
 * DELETE /api/linkedin/disconnect/:profileId
 */
router.delete('/disconnect/:profileId', async (req, res) => {
    try {
        const userId = req.user.id;
        const profileId = req.params.profileId;

        const { error } = await supabase
            .from('linkedin_connections')
            .delete()
            .eq('user_id', userId)
            .eq('profile_id', profileId);

        if (error) throw error;

        res.json({ success: true, message: 'LinkedIn account disconnected' });
    } catch (error) {
        console.error('LinkedIn disconnect error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
