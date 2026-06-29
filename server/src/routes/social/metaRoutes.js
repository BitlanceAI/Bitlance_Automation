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

/**
 * Instagram Business Login callback — no auth
 * Handles both webhook verification (hub.mode) and OAuth redirect (code)
 * GET /api/meta/instagram/callback
 */
router.get('/instagram/callback', async (req, res) => {
    // Webhook verification challenge from Meta
    if (req.query['hub.mode'] === 'subscribe') {
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (token === process.env.META_VERIFY_TOKEN) {
            console.log('[Instagram Webhook] Verified');
            return res.status(200).send(challenge);
        }
        return res.sendStatus(403);
    }

    // OAuth redirect with authorization code
    const { code, state, error } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    let destination = clientUrl + '/SocialDashboard';
    if (state) {
        try { destination = decodeURIComponent(state); } catch (_) {}
    }

    if (error || !code) {
        return res.redirect(`${destination}?error=${error || 'no_code'}`);
    }

    const separator = destination.includes('?') ? '&' : '?';
    res.redirect(`${destination}${separator}code=${code}&platform=instagram_business`);
});

/**
 * OAuth Callback handler (Backend) — no auth, called by Meta redirect
 * GET /api/meta/oauth/callback
 */
router.get('/oauth/callback', (req, res) => {
    const { code, state, error, error_description } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    let destination = clientUrl + '/SocialDashboard';
    let connectPlatform = 'facebook';
    if (state && state !== 'meta_auth') {
        try {
            const parsed = JSON.parse(decodeURIComponent(state));
            destination = parsed.dest || destination;
            connectPlatform = parsed.platform || 'facebook';
        } catch (e) {
            // Fallback: treat state as plain URL (backwards compat)
            try { destination = decodeURIComponent(state); } catch (_) {}
        }
    }

    if (error) {
        return res.redirect(`${destination}?error=${error}&description=${error_description}`);
    }

    if (!code) {
        return res.redirect(`${destination}?error=no_code`);
    }

    const separator = destination.includes('?') ? '&' : '?';
    res.redirect(`${destination}${separator}code=${code}&platform=meta&connect_platform=${connectPlatform}`);
});

router.use(authMiddleware);

/**
 * Get Instagram Business Login OAuth URL
 * GET /api/meta/instagram/url
 */
router.get('/instagram/url', (req, res) => {
    if (!process.env.INSTAGRAM_APP_ID || !process.env.INSTAGRAM_APP_SECRET) {
        return res.status(500).json({ error: 'Instagram app not configured' });
    }
    const redirectUri = process.env.SERVER_URL
        ? `${process.env.SERVER_URL}/api/meta/instagram/callback`
        : `http://localhost:3001/api/meta/instagram/callback`;

    const frontendDestination = req.query.redirect_uri || (process.env.CLIENT_URL || 'http://localhost:5173') + '/SocialDashboard';
    const state = encodeURIComponent(frontendDestination);

    const url = MetaService.getInstagramOAuthUrl(redirectUri, state);
    res.json({ success: true, url });
});

/**
 * Exchange Instagram Business Login code and save profile
 * POST /api/meta/instagram/connect
 */
router.post('/instagram/connect', async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code) return res.status(400).json({ error: 'Code is required' });

        const redirectUri = process.env.SERVER_URL
            ? `${process.env.SERVER_URL}/api/meta/instagram/callback`
            : `http://localhost:3001/api/meta/instagram/callback`;

        console.log('[IG Connect] Exchanging code with redirect_uri:', redirectUri);

        // Exchange code for short-lived token
        const tokenData = await MetaService.exchangeInstagramCodeForToken(code, redirectUri);
        console.log('[IG Connect] Token data:', tokenData);
        const shortToken = tokenData.access_token;
        const igUserId = tokenData.user_id;

        // Exchange for long-lived token (Wrap in try-catch as IG Business Login might not support this GET endpoint)
        let accessToken = shortToken;
        try {
            const longData = await MetaService.getInstagramLongLivedToken(shortToken);
            accessToken = longData.access_token || shortToken;
        } catch (tokenErr) {
            console.warn('[IG Connect] Long-lived token exchange skipped or failed:', tokenErr.response?.data?.error?.message || tokenErr.message);
        }

        // Fetch profile info (optional — fall back to token data if unavailable)
        let profile = { id: String(igUserId), username: 'instagram_user' };
        try {
            profile = await MetaService.getInstagramProfile(accessToken, igUserId);
        } catch (profileErr) {
            console.warn('[IG Connect] Profile fetch skipped:', profileErr.response?.data?.error?.message || profileErr.message);
        }

        const encryptedToken = encryptData(accessToken);

        // Save as a meta_connection with platform=instagram
        await supabase.from('meta_connections').upsert({
            user_id: userId,
            connection_type: 'instagram_business',
            access_token: encryptedToken,
            app_id: process.env.INSTAGRAM_APP_ID,
            pages: [{
                platform: 'instagram',
                type: 'Instagram Business',
                profileId: String(igUserId),
                name: profile.name || profile.username || `IG:${igUserId}`,
                username: profile.username || null,
                profilePicture: profile.profile_picture_url || null
            }],
            is_active: true,
            workspace_id: req.workspaceId || null,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,app_id' }).select().single();

        res.json({ success: true, profile });
    } catch (err) {
        const igError = err.response?.data;
        console.error('[Instagram Business Connect] Full error:', JSON.stringify(igError) || err.message);
        res.status(500).json({ error: igError?.error_message || igError?.error?.message || err.message, details: igError });
    }
});

/**
 * Get OAuth authorization URL
 * GET /api/meta/oauth/url
 */
router.get('/oauth/url', (req, res) => {
    if (!META_APP_ID) {
        return res.status(500).json({ error: 'Meta App ID not configured' });
    }
    
    // Always use the backend callback as redirect_uri (must match Meta App whitelist)
    const backendCallback = process.env.SERVER_URL
        ? `${process.env.SERVER_URL}/api/meta/oauth/callback`
        : META_REDIRECT_URI;

    const frontendDestination = req.query.redirect_uri || (process.env.CLIENT_URL || 'http://localhost:5173') + '/SocialDashboard';
    const connectPlatform = req.query.platform || 'facebook'; // 'facebook' or 'instagram'
    // Encode both destination and platform in state as JSON
    const state = encodeURIComponent(JSON.stringify({ dest: frontendDestination, platform: connectPlatform }));

    const authUrl = MetaService.getOAuthUrl(META_APP_ID, backendCallback, state);
    res.json({ success: true, url: authUrl });
});


/**
 * Exchange code for token and save profile
 * POST /api/meta/connect
 */
router.post('/connect', async (req, res) => {
    try {
        const { code, redirect_uri, connect_platform } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const redirectUri = redirect_uri || (process.env.SERVER_URL
            ? `${process.env.SERVER_URL}/api/meta/oauth/callback`
            : META_REDIRECT_URI);

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

        // Filter accounts by the platform the user intended to connect
        let pages = accountsResult.accounts;
        if (connect_platform === 'instagram') {
            pages = pages.filter(p => p.platform === 'instagram');
        } else if (connect_platform === 'facebook') {
            pages = pages.filter(p => p.platform === 'facebook' || !p.platform);
        }

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
        console.log(`[Meta API] Received POST request from User ID: ${req.user?.id}`);
        console.log(`[Meta API] Request Body:`, JSON.stringify(req.body, null, 2));

        const { accountId, platform, text, mediaUrl } = req.body;
        const userId = req.user.id;

        if (!accountId || !platform || !text) {
            console.warn(`[Meta API] Missing required fields. accountId: ${!!accountId}, platform: ${!!platform}, text: ${!!text}`);
            return res.status(400).json({ error: 'accountId, platform, and text are required' });
        }

        const { data: connection, error: dbError } = await supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (dbError || !connection) {
            console.warn(`[Meta API] No active Meta connection found for user ${userId}. DB Error:`, dbError?.message);
            return res.status(404).json({ error: 'Meta connection not found' });
        }

        const pages = connection.pages || [];
        const account = pages.find(p => p.accountId === accountId && p.platform === platform);

        if (!account) {
            console.warn(`[Meta API] Specific account not found in user's connected pages. Requested: ${accountId} on ${platform}`);
            return res.status(404).json({ error: 'Specific Meta account not found' });
        }
        
        console.log(`[Meta API] Found account: ${account.name} (${account.accountId})`);

        const { decryptData } = await import('../../../utils/encryption.js');
        let accessToken;
        try {
            accessToken = decryptData(connection.access_token);
        } catch {
            console.error(`[Meta API] Failed to decrypt access token for user ${userId}`);
            return res.status(500).json({ error: 'Failed to decrypt access token' });
        }

        const pageToken = account.accessToken || accessToken;
        
        const MetaServiceClass = (await import('../../services/social/metaService.js')).default;
        const metaService = new MetaServiceClass(pageToken);

        console.log(`[Meta API] Initiating ${platform} post for account ${accountId}...`);
        console.log(`[Meta API] Media URL included:`, !!mediaUrl);

        let result;
        if (platform === 'facebook') {
            result = await metaService.createFacebookPost(accountId, text, mediaUrl);
        } else if (platform === 'instagram') {
            result = await metaService.createInstagramPost(accountId, text, mediaUrl);
        } else {
            console.warn(`[Meta API] Invalid platform requested: ${platform}`);
            return res.status(400).json({ error: 'Invalid platform' });
        }

        if (!result.success) {
            console.error(`[Meta API] Failed to publish post:`, result.error);
            return res.status(400).json({ error: result.error });
        }

        console.log(`[Meta API] ✅ Post published successfully! Post ID: ${result.postId}`);

        res.json({
            success: true,
            message: 'Post published successfully',
            postId: result.postId
        });

    } catch (error) {
        console.error('[Meta API] 💥 Unhandled error in /post:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/meta/comments/:accountId
 * Fetch recent media + comments for an Instagram account, upsert to DB
 */
router.get('/comments/:accountId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { accountId } = req.params;

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
        const account = pages.find(p => p.accountId === accountId && p.platform === 'instagram');

        if (!account) {
            return res.status(404).json({ error: 'Instagram account not found' });
        }

        const { decryptData } = await import('../../../utils/encryption.js');
        const accessToken = account.accessToken || decryptData(connection.access_token);

        const MetaServiceClass = (await import('../../services/social/metaService.js')).default;
        const metaService = new MetaServiceClass(accessToken);

        // Fetch recent media
        const mediaResult = await metaService.getInstagramMedia(accountId, 10);
        if (!mediaResult.success) {
            return res.status(400).json({ error: mediaResult.error });
        }

        // Fetch comments for each media
        const mediaWithComments = await Promise.all(
            mediaResult.media.map(async (post) => {
                const commentsResult = await metaService.getComments(post.id);
                const comments = commentsResult.success ? commentsResult.comments : [];

                // Upsert comments to DB (best-effort, no-throw)
                if (comments.length > 0) {
                    const rows = comments.map(c => ({
                        user_id: userId,
                        ig_comment_id: c.id,
                        post_ig_media_id: post.id,
                        text: c.text,
                        username: c.username,
                        timestamp: c.timestamp,
                        replied: false,
                        workspace_id: req.workspaceId || null
                    }));

                    await supabase.from('ig_comments').upsert(rows, {
                        onConflict: 'ig_comment_id',
                        ignoreDuplicates: true
                    });
                }

                return { ...post, comments };
            })
        );

        res.json({ success: true, media: mediaWithComments });
    } catch (error) {
        console.error('[Meta Comments] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/meta/comments/:commentId/reply
 * Reply to an Instagram comment
 */
router.post('/comments/:commentId/reply', async (req, res) => {
    try {
        const userId = req.user.id;
        const { commentId } = req.params;
        const { message, accountId } = req.body;

        if (!message || !accountId) {
            return res.status(400).json({ error: 'message and accountId are required' });
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
        const account = pages.find(p => p.accountId === accountId && p.platform === 'instagram');

        if (!account) {
            return res.status(404).json({ error: 'Instagram account not found' });
        }

        const { decryptData } = await import('../../../utils/encryption.js');
        const accessToken = account.accessToken || decryptData(connection.access_token);

        const MetaServiceClass = (await import('../../services/social/metaService.js')).default;
        const metaService = new MetaServiceClass(accessToken);

        const result = await metaService.replyToComment(commentId, message);
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        // Mark as replied in DB (best-effort)
        await supabase
            .from('ig_comments')
            .update({ replied: true, reply_text: message })
            .eq('ig_comment_id', commentId)
            .eq('user_id', userId);

        res.json({ success: true, replyId: result.replyId });
    } catch (error) {
        console.error('[Meta Comments Reply] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
