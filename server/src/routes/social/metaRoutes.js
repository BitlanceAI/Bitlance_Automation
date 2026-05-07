import express from 'express';
import { createClient } from '@supabase/supabase-js';
import MetaService from '../../services/social/metaService.js';
import { encryptData, decryptData } from '../../../utils/encryption.js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
// Redirect URI can be dynamic based on origin, but usually static in Meta App settings
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'http://localhost:5173/dashboard';

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
        req.workspaceId = req.headers['x-workspace-id'] || null;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

router.use(authMiddleware);

/**
 * Get OAuth authorization URL
 * GET /api/meta/oauth/url
 */
router.get('/oauth/url', (req, res) => {
    if (!META_APP_ID) {
        return res.status(500).json({ error: 'Meta App ID not configured' });
    }
    
    // The redirectUri is the BACKEND URL that Facebook will call
    // If not provided in query, use the fallback from env
    const redirectUri = req.query.redirect_uri || META_REDIRECT_URI;
    
    // We can pass the "final" frontend destination in the state parameter
    // If the frontend passed a redirect_uri, it's likely where it wants to end up
    const state = req.query.redirect_uri ? encodeURIComponent(req.query.redirect_uri) : 'meta_auth';
    
    const authUrl = MetaService.getOAuthUrl(META_APP_ID, redirectUri, state);
    res.json({ success: true, url: authUrl });
});

/**
 * OAuth Callback handler (Backend)
 * GET /api/meta/oauth/callback
 */
router.get('/oauth/callback', (req, res) => {
    const { code, state, error, error_description } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    // If state contains a URL, use it as the final destination
    let destination = clientUrl + '/dashboard';
    if (state && state !== 'meta_auth') {
        try {
            destination = decodeURIComponent(state);
        } catch (e) {
            console.error('Failed to decode state URL:', e);
        }
    }

    if (error) {
        return res.redirect(`${destination}?error=${error}&description=${error_description}`);
    }
    
    if (!code) {
        return res.redirect(`${destination}?error=no_code`);
    }

    // Redirect back to frontend with the code
    // The frontend SocialDashboard.jsx will detect this and call /api/meta/connect
    const separator = destination.includes('?') ? '&' : '?';
    res.redirect(`${destination}${separator}code=${code}&platform=meta`);
});

/**
 * Exchange code for token and save profile
 * POST /api/meta/connect
 */
router.post('/connect', async (req, res) => {
    try {
        const { code, redirect_uri } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const redirectUri = redirect_uri || META_REDIRECT_URI;

        // Exchange code for short-lived token
        const tokenResult = await MetaService.exchangeCodeForToken(
            code,
            META_APP_ID,
            META_APP_SECRET,
            redirectUri
        );

        if (!tokenResult.success) {
            return res.status(400).json({ error: tokenResult.error });
        }

        // Exchange for long-lived token
        const longLivedResult = await MetaService.getLongLivedToken(
            tokenResult.accessToken,
            META_APP_ID,
            META_APP_SECRET
        );

        const accessToken = longLivedResult.success ? longLivedResult.accessToken : tokenResult.accessToken;
        
        // Use token to get user profile and pages/instagram accounts
        const metaService = new MetaService(accessToken);
        
        const accountsResult = await metaService.getPagesAndInstagramAccounts();

        if (!accountsResult.success) {
            return res.status(400).json({ error: 'Failed to fetch Meta pages and accounts' });
        }

        const pages = accountsResult.accounts;

        // Encrypt token
        let encryptedToken;
        try {
            encryptedToken = encryptData(accessToken);
        } catch (encError) {
            console.error('Meta encryption error:', encError);
            return res.status(500).json({ error: 'Encryption configuration error' });
        }

        // Store in database in meta_connections
        const { data: connection, error } = await supabase
            .from('meta_connections')
            .upsert({
                user_id: userId,
                connection_type: 'oauth',
                access_token: encryptedToken,
                app_id: META_APP_ID,
                app_secret: META_APP_SECRET, // optional
                pages: pages,
                is_active: true,
                workspace_id: req.workspaceId || null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id' // Assuming user_id is the unique key, adjust if necessary
            })
            .select()
            .single();

        if (error) {
            console.error('Meta database error:', error);
            throw error;
        }

        res.json({
            success: true,
            message: 'Meta accounts connected successfully',
            accounts: pages
        });

    } catch (error) {
        console.error('Meta connect error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get current active Meta connection
 * GET /api/meta/connection
 */
router.get('/connection', async (req, res) => {
    try {
        const userId = req.user.id;

        let query = supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (req.workspaceId) {
            query = query.eq('workspace_id', req.workspaceId);
        }

        const { data: connections, error } = await query;

        if (error) throw error;

        if (!connections || connections.length === 0) {
            return res.json({ connected: false, profiles: [] });
        }

        const metaConnection = connections[0];
        
        // Return pages data as profiles
        const pages = metaConnection.pages || [];
        
        // Format to exclude tokens for safety (tokens inside pages object)
        const safeProfiles = pages.map(page => ({
            platform: page.platform,
            profileId: page.accountId,
            name: page.name,
            profilePicture: page.picture,
            type: page.type,
            workspaceId: metaConnection.workspace_id
        }));

        res.json({
            connected: true,
            profiles: safeProfiles
        });
    } catch (error) {
        console.error('Get Meta connection error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/meta/subscribe-pages
 * Subscribe all stored pages to receive webhooks (call this once after OAuth connect)
 */
router.post('/subscribe-pages', async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: connections, error } = await supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw error;

        if (!connections || connections.length === 0) {
            return res.status(404).json({ error: 'No Meta connections found. Please connect Facebook first.' });
        }

        const { decryptData } = await import('../../utils/encryption.js');
        const MetaService = (await import('../../services/social/metaService.js')).default;

        const results = [];

        for (const connection of connections) {
            const pages = connection.pages || [];

            for (const page of pages) {
                if (page.platform !== 'facebook') continue; // Only pages need subscription, not IG

                try {
                    const pageToken = page.accessToken || decryptData(connection.access_token);
                    const metaService = new MetaService(pageToken);

                    const response = await metaService.client.post(
                        `/${page.accountId}/subscribed_apps`,
                        null,
                        {
                            params: {
                                subscribed_fields: 'messages,messaging_postbacks,message_reads,message_deliveries',
                                access_token: pageToken
                            }
                        }
                    );

                    console.log(`[Meta] Subscribed page ${page.name} (${page.accountId}):`, response.data);
                    results.push({ page: page.name, pageId: page.accountId, success: true, result: response.data });
                } catch (pageError) {
                    console.error(`[Meta] Failed to subscribe page ${page.name}:`, pageError.response?.data || pageError.message);
                    results.push({ page: page.name, pageId: page.accountId, success: false, error: pageError.response?.data || pageError.message });
                }
            }
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error('Subscribe pages error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create a Meta post (Facebook or Instagram)
 * POST /api/meta/post
 * Body: { accountId, platform, text, mediaUrl }
 */
router.post('/post', async (req, res) => {
    try {
        const { accountId, platform, text, mediaUrl } = req.body;
        const userId = req.user.id;

        if (!accountId || !platform || !text) {
            return res.status(400).json({ error: 'accountId, platform, and text are required' });
        }

        const { data: connection, error: dbError } = await supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (dbError || !connection) {
            return res.status(404).json({ error: 'Meta connection not found' });
        }

        const pages = connection.pages || [];
        const account = pages.find(p => p.accountId === accountId && p.platform === platform);

        if (!account) {
            return res.status(404).json({ error: 'Specific Meta account not found' });
        }

        const { decryptData } = await import('../../../utils/encryption.js');
        let accessToken;
        try {
            accessToken = decryptData(connection.access_token);
        } catch {
            return res.status(500).json({ error: 'Failed to decrypt access token' });
        }

        const pageToken = account.accessToken || accessToken;
        
        const MetaServiceClass = (await import('../../services/social/metaService.js')).default;
        const metaService = new MetaServiceClass(pageToken);

        let result;
        if (platform === 'facebook') {
            result = await metaService.createFacebookPost(accountId, text, mediaUrl);
        } else if (platform === 'instagram') {
            result = await metaService.createInstagramPost(accountId, text, mediaUrl);
        } else {
            return res.status(400).json({ error: 'Invalid platform' });
        }

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({
            success: true,
            message: 'Post published successfully',
            postId: result.postId
        });

    } catch (error) {
        console.error('Meta post error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
