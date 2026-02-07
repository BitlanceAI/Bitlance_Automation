/**
 * Meta Ads API Routes
 * Handles Meta account connection, post scheduling, and campaign management
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import MetaService from '../services/metaService.js';
import { encryptData, decryptData } from '../../utils/encryption.js';

const router = express.Router();

import multer from 'multer';

// Configure Multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Initialize Supabase with service role key to bypass RLS
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Meta App Config
const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'http://localhost:5000/api/meta/oauth/callback';

/**
 * Middleware to verify Supabase auth token
 */
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

// Apply auth middleware to all routes
router.use(authMiddleware);

// ==================== UPLOAD ROUTES ====================

/**
 * Upload Media for Posts
 * POST /api/meta/posts/upload-media
 */
router.post('/posts/upload-media', upload.array('files'), async (req, res) => {
    try {
        const userId = req.user.id;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadedUrls = [];

        for (const file of files) {
            // Generate unique filename
            const filename = `${userId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`;

            // Upload to Supabase Storage ('post-media' bucket)
            const { data, error } = await supabase
                .storage
                .from('post-media')
                .upload(filename, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error('Supabase upload error:', error);
                throw error;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('post-media')
                .getPublicUrl(filename);

            uploadedUrls.push(publicUrl);
        }

        res.json({ success: true, urls: uploadedUrls });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: `Upload failed: ${error.message}` });
    }
});

// ==================== CONNECTION ROUTES ====================

/**
 * Connect Meta account using API Key/Access Token
 * POST /api/meta/connect-api-key
 */
router.post('/connect-api-key', async (req, res) => {
    try {
        const { accessToken, appId, appSecret } = req.body;
        const userId = req.user.id;

        console.log(`🔌 [Meta Connect] Request received for user ${userId}`);

        if (!accessToken) {
            console.log(`❌ [Meta Connect] Missing access token`);
            return res.status(400).json({ error: 'Access token is required' });
        }

        // Validate the token
        console.log(`🔍 [Meta Connect] Validating token...`);
        const metaService = new MetaService(accessToken);
        const validation = await metaService.validateToken();

        if (!validation.success || !validation.isValid) {
            console.log(`❌ [Meta Connect] Token invalid:`, validation);
            return res.status(400).json({ error: 'Invalid access token' });
        }
        console.log(`✅ [Meta Connect] Token valid. Expires at: ${validation.expiresAt}`);

        // Get user profile to verify
        console.log(`👤 [Meta Connect] Fetching user profile...`);
        const profile = await metaService.getMe();
        if (!profile.success) {
            console.log(`❌ [Meta Connect] Failed to fetch profile:`, profile);
            return res.status(400).json({ error: 'Failed to fetch Meta profile' });
        }
        console.log(`✅ [Meta Connect] Profile fetched for: ${profile.data.name}`);

        // Fetch pages and ad accounts
        console.log(`📄 [Meta Connect] Fetching pages and ad accounts...`);
        const pagesResult = await metaService.getPages();
        const adAccountsResult = await metaService.getAdAccounts();
        console.log(`✅ [Meta Connect] Pages: ${pagesResult.success ? pagesResult.pages?.length : 'failed'}, AdAccounts: ${adAccountsResult.success ? adAccountsResult.adAccounts?.length : 'failed'}`);

        // Encrypt sensitive data
        console.log(`🔐 [Meta Connect] Encrypting data...`);
        let encryptedToken, encryptedAppSecret;
        try {
            encryptedToken = encryptData(accessToken);
            encryptedAppSecret = appSecret ? encryptData(appSecret) : null;
        } catch (encError) {
            console.error(`💥 [Meta Connect] Encryption failed:`, encError);
            return res.status(500).json({ error: 'Server encryption configuration error' });
        }

        // Upsert connection
        console.log(`💾 [Meta Connect] Saving to database...`);
        const { data: connection, error } = await supabase
            .from('meta_connections')
            .upsert({
                user_id: userId,
                connection_type: 'api_key',
                access_token: encryptedToken,
                app_id: appId || null,
                app_secret: encryptedAppSecret,
                token_expires_at: validation.expiresAt,
                pages: pagesResult.success ? pagesResult.pages : [],
                ad_accounts: adAccountsResult.success ? adAccountsResult.adAccounts : [],
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) {
            console.error(`❌ [Meta Connect] Database error:`, error);
            throw error;
        }

        console.log(`✅ [Meta Connect] Meta account connected successfully for user ${userId}`);

        res.json({
            success: true,
            message: 'Meta account connected successfully',
            profile: profile.data,
            pages: pagesResult.success ? pagesResult.pages : [],
            adAccounts: adAccountsResult.success ? adAccountsResult.adAccounts : [],
            expiresAt: validation.expiresAt
        });

    } catch (error) {
        console.error('Meta connect error:', error);
        res.status(500).json({ error: error.message });
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

    const authUrl = MetaService.getOAuthUrl(META_APP_ID, META_REDIRECT_URI);
    res.json({ success: true, url: authUrl });
});

/**
 * OAuth callback handler
 * GET /api/meta/oauth/callback
 */
router.get('/oauth/callback', async (req, res) => {
    try {
        const { code, error, error_description } = req.query;

        if (error) {
            return res.redirect(`/meta-ads-agent?error=${encodeURIComponent(error_description || error)}`);
        }

        if (!code) {
            return res.redirect('/meta-ads-agent?error=No authorization code received');
        }

        // Exchange code for token
        const tokenResult = await MetaService.exchangeCodeForToken(
            code,
            META_APP_ID,
            META_APP_SECRET,
            META_REDIRECT_URI
        );

        if (!tokenResult.success) {
            return res.redirect(`/meta-ads-agent?error=${encodeURIComponent(tokenResult.error)}`);
        }

        // Exchange for long-lived token
        const longLivedResult = await MetaService.exchangeToken(
            tokenResult.accessToken,
            META_APP_ID,
            META_APP_SECRET
        );

        const finalToken = longLivedResult.success ? longLivedResult.accessToken : tokenResult.accessToken;
        const expiresIn = longLivedResult.success ? longLivedResult.expiresIn : tokenResult.expiresIn;

        // Store token in session/temp storage for frontend to complete connection
        // For now, redirect with token (in production, use secure session)
        res.redirect(`/meta-ads-agent?oauth_success=true&token=${encodeURIComponent(finalToken)}&expires_in=${expiresIn}`);

    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`/meta-ads-agent?error=${encodeURIComponent(error.message)}`);
    }
});

/**
 * Get current Meta connection status
 * GET /api/meta/connection
 */
router.get('/connection', async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: connection, error } = await supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (!connection) {
            return res.json({ connected: false });
        }

        // Check if token is still valid
        const decryptedToken = decryptData(connection.access_token);
        const metaService = new MetaService(decryptedToken);
        const validation = await metaService.validateToken();

        res.json({
            connected: true,
            isValid: validation.isValid,
            expiresAt: connection.token_expires_at,
            pages: connection.pages || [],
            adAccounts: connection.ad_accounts || [],
            connectionType: connection.connection_type
        });

    } catch (error) {
        console.error('Get connection error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Disconnect Meta account
 * DELETE /api/meta/disconnect
 */
router.delete('/disconnect', async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await supabase
            .from('meta_connections')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;

        console.log(`🔌 Meta account disconnected for user ${userId}`);

        res.json({ success: true, message: 'Meta account disconnected' });

    } catch (error) {
        console.error('Disconnect error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Refresh pages and ad accounts
 * POST /api/meta/refresh-accounts
 */
router.post('/refresh-accounts', async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: connection, error: fetchError } = await supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (fetchError || !connection) {
            return res.status(404).json({ error: 'No active Meta connection' });
        }

        const decryptedToken = decryptData(connection.access_token);
        const metaService = new MetaService(decryptedToken);

        const pagesResult = await metaService.getPages();
        const adAccountsResult = await metaService.getAdAccounts();

        // Update stored data
        const { error: updateError } = await supabase
            .from('meta_connections')
            .update({
                pages: pagesResult.success ? pagesResult.pages : connection.pages,
                ad_accounts: adAccountsResult.success ? adAccountsResult.adAccounts : connection.ad_accounts,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (updateError) throw updateError;

        res.json({
            success: true,
            pages: pagesResult.success ? pagesResult.pages : [],
            adAccounts: adAccountsResult.success ? adAccountsResult.adAccounts : []
        });

    } catch (error) {
        console.error('Refresh accounts error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== POST SCHEDULING ROUTES ====================

/**
 * Schedule a post
 * POST /api/meta/posts/schedule
 */
router.post('/posts/schedule', async (req, res) => {
    try {
        const userId = req.user.id;
        const { pageId, content, mediaUrls, linkUrl, scheduledTime, timezone } = req.body;

        if (!pageId || !content || !scheduledTime) {
            return res.status(400).json({ error: 'pageId, content, and scheduledTime are required' });
        }

        // Get connection
        const { data: connection, error: connError } = await supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (connError || !connection) {
            return res.status(404).json({ error: 'No active Meta connection' });
        }

        // Find page details
        const page = connection.pages.find(p => p.id === pageId);
        if (!page) {
            return res.status(404).json({ error: 'Page not found in connected accounts' });
        }

        // Create scheduled post record
        const { data: scheduledPost, error } = await supabase
            .from('scheduled_posts')
            .insert({
                user_id: userId,
                meta_connection_id: connection.id,
                page_id: pageId,
                page_name: page.name,
                content,
                media_urls: mediaUrls || [],
                link_url: linkUrl || null,
                scheduled_time: scheduledTime,
                timezone: timezone || 'UTC',
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`📅 Post scheduled for ${scheduledTime} on page ${page.name}`);

        res.json({
            success: true,
            message: 'Post scheduled successfully',
            post: scheduledPost
        });

    } catch (error) {
        console.error('Schedule post error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get scheduled posts
 * GET /api/meta/posts/scheduled
 */
router.get('/posts/scheduled', async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, limit = 50 } = req.query;

        let query = supabase
            .from('scheduled_posts')
            .select('*')
            .eq('user_id', userId)
            .order('scheduled_time', { ascending: true })
            .limit(parseInt(limit));

        if (status) {
            query = query.eq('status', status);
        }

        const { data: posts, error } = await query;

        if (error) throw error;

        res.json({ success: true, posts: posts || [] });

    } catch (error) {
        console.error('Get scheduled posts error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Cancel/Delete a scheduled post
 * DELETE /api/meta/posts/:id
 */
router.delete('/posts/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { error } = await supabase
            .from('scheduled_posts')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .eq('status', 'pending'); // Can only delete pending posts

        if (error) throw error;

        res.json({ success: true, message: 'Scheduled post deleted' });

    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper to handle Meta API errors
const handleMetaError = async (res, userId, errorResult) => {
    if (errorResult.code === 190 || errorResult.code === 463 || errorResult.code === 467) {
        console.log(`🔒 [Meta] Token expired/invalid (Code ${errorResult.code}) for user ${userId}. Deactivating connection.`);

        // Deactivate connection in DB
        await supabase
            .from('meta_connections')
            .update({ is_active: false })
            .eq('user_id', userId);

        return res.status(401).json({
            success: false,
            error: 'Meta session expired. Please reconnect your account.',
            code: 'TOKEN_EXPIRED'
        });
    }
    return res.status(400).json({ error: errorResult.error });
};

// ==================== CAMPAIGN ROUTES ====================

/**
 * Get campaigns with insights
 * GET /api/meta/campaigns
 */
router.get('/campaigns', async (req, res) => {
    try {
        const userId = req.user.id;
        const { adAccountId, datePreset = 'last_30d' } = req.query;

        const { data: connection, error: connError } = await supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (connError || !connection) {
            return res.status(404).json({ error: 'No active Meta connection' });
        }

        const decryptedToken = decryptData(connection.access_token);
        const metaService = new MetaService(decryptedToken);

        // Get the ad account ID (use provided or first available)
        const targetAdAccountId = adAccountId ||
            (connection.ad_accounts && connection.ad_accounts[0]?.account_id);

        if (!targetAdAccountId) {
            return res.json({ success: true, campaigns: [], message: 'No ad accounts found' });
        }

        // Fetch campaigns
        const campaignsResult = await metaService.getCampaigns(targetAdAccountId);

        if (!campaignsResult.success) {
            return handleMetaError(res, userId, campaignsResult);
        }

        // Fetch insights for each campaign
        const campaignsWithInsights = await Promise.all(
            (campaignsResult.data.data || []).map(async (campaign) => {
                const insightsResult = await metaService.getCampaignInsights(campaign.id, datePreset);
                return {
                    ...campaign,
                    insights: insightsResult.success ? (insightsResult.data.data?.[0] || {}) : {}
                };
            })
        );

        res.json({
            success: true,
            campaigns: campaignsWithInsights,
            adAccountId: targetAdAccountId
        });

    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get aggregated ad account insights
 * GET /api/meta/insights
 */
router.get('/insights', async (req, res) => {
    try {
        const userId = req.user.id;
        const { adAccountId, datePreset = 'last_30d' } = req.query;

        const { data: connection, error: connError } = await supabase
            .from('meta_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (connError || !connection) {
            return res.status(404).json({ error: 'No active Meta connection' });
        }

        let decryptedToken;
        try {
            decryptedToken = decryptData(connection.access_token);
            if (!decryptedToken) throw new Error('Decrypted token is null');
        } catch (e) {
            console.error(`Decryption failed! Key might have changed.`, e);
            return res.status(500).json({ error: 'Failed to decrypt access token. Please reconnect your account.' });
        }

        const metaService = new MetaService(decryptedToken);

        const targetAdAccountId = adAccountId ||
            (connection.ad_accounts && connection.ad_accounts[0]?.account_id);

        if (!targetAdAccountId) {
            return res.json({ success: true, insights: {}, message: 'No ad accounts found' });
        }

        const insightsResult = await metaService.getAdAccountInsights(targetAdAccountId, datePreset);

        if (!insightsResult.success) {
            return handleMetaError(res, userId, insightsResult);
        }

        res.json({
            success: true,
            insights: insightsResult.success ? (insightsResult.data.data?.[0] || {}) : {},
            adAccountId: targetAdAccountId
        });

    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
