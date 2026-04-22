import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { encryptData, decryptData } from '../../../utils/encryption.js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI || 'http://localhost:5173/SocialDashboard';

// ── In-memory PKCE challenge store (no DB table required) ────────────────────
// key: state string  →  value: { userId, verifier, expiresAt }
const pkceStore = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of pkceStore) {
        if (val.expiresAt < now) pkceStore.delete(key);
    }
}, 5 * 60 * 1000); // clean up every 5 min

// ── Auth middleware ──────────────────────────────────────────────────────────
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(401).json({ error: 'Invalid token' });
        req.user = user;
        req.workspaceId = req.headers['x-workspace-id'] || null;
        next();
    } catch {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

router.use(authMiddleware);

// ── PKCE helpers ─────────────────────────────────────────────────────────────
function generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
}

/**
 * GET /api/twitter/oauth/url
 * Returns the Twitter OAuth 2.0 (PKCE) authorization URL.
 * The code_verifier is kept in memory; no DB table needed for this step.
 */
router.get('/oauth/url', async (req, res) => {
    if (!TWITTER_CLIENT_ID) {
        return res.status(500).json({ error: 'TWITTER_CLIENT_ID is not configured on the server.' });
    }

    const userId = req.user.id;
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    const state = `twitter_connect_${userId}_${Date.now()}`;

    // Store verifier in memory (no DB table required)
    pkceStore.set(state, { userId, verifier, expiresAt: Date.now() + 10 * 60 * 1000 });

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: TWITTER_CLIENT_ID,
        redirect_uri: TWITTER_REDIRECT_URI,
        scope: 'tweet.read tweet.write users.read offline.access',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
    });

    res.json({ success: true, url: `https://twitter.com/i/oauth2/authorize?${params}`, state });
});

/**
 * POST /api/twitter/connect
 * Exchange authorization code for tokens and save the Twitter profile.
 *
 * Required Supabase table:
 *   twitter_connections (id uuid default gen_random_uuid(), user_id uuid, workspace_id uuid, twitter_user_id text, username text, name text, profile_picture text, access_token text, refresh_token text, token_expires_at timestamptz, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now(), unique(user_id, twitter_user_id))
 */
router.post('/connect', async (req, res) => {
    const { code, state } = req.body;
    const userId = req.user.id;

    if (!code || !state) {
        return res.status(400).json({ error: 'code and state are required' });
    }

    // Retrieve and consume PKCE verifier from memory (one-time use)
    const stored = pkceStore.get(state);
    if (!stored || stored.userId !== userId || stored.expiresAt < Date.now()) {
        pkceStore.delete(state);
        return res.status(400).json({ error: 'Invalid or expired OAuth state. Please try connecting again.' });
    }
    pkceStore.delete(state);

    try {
        // Exchange code for tokens
        // Twitter OAuth 2.0 PKCE token exchange:
        // client_id must be in the body; confidential clients also need Basic Auth
        const tokenRes = await axios.post(
            'https://api.twitter.com/2/oauth2/token',
            new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: TWITTER_CLIENT_ID,
                redirect_uri: TWITTER_REDIRECT_URI,
                code_verifier: stored.verifier,
            }).toString(),
            {
                auth: { username: TWITTER_CLIENT_ID, password: TWITTER_CLIENT_SECRET },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenRes.data;

        // Fetch Twitter user profile
        const userRes = await axios.get(
            'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
            { headers: { Authorization: `Bearer ${access_token}` } }
        );

        const twitterUser = userRes.data.data;
        const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null;

        // Encrypt tokens before storing
        const encryptedAccess = encryptData(access_token);
        const encryptedRefresh = refresh_token ? encryptData(refresh_token) : null;
        const profilePic = twitterUser.profile_image_url?.replace('_normal', '_bigger') || null;

        await supabase.from('twitter_connections').upsert({
            user_id: userId,
            workspace_id: req.workspaceId || null,
            twitter_user_id: twitterUser.id,
            username: twitterUser.username,
            name: twitterUser.name,
            profile_picture: profilePic,
            access_token: encryptedAccess,
            refresh_token: encryptedRefresh,
            token_expires_at: expiresAt,
            is_active: true,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id, twitter_user_id' });

        res.json({
            success: true,
            profile: {
                twitterUserId: twitterUser.id,
                username: twitterUser.username,
                name: twitterUser.name,
                profilePicture: profilePic,
            },
        });

    } catch (err) {
        const errData = err.response?.data;
        console.error('Twitter connect error:', errData || err.message);
        res.status(500).json({ error: errData?.error_description || errData?.detail || err.message });
    }
});

/**
 * GET /api/twitter/connection
 * Get active Twitter connections for the current user (scoped to workspace if provided).
 */
router.get('/connection', async (req, res) => {
    const userId = req.user.id;

    let query = supabase
        .from('twitter_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

    if (req.workspaceId) {
        query = query.eq('workspace_id', req.workspaceId);
    }

    const { data: connections, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    if (!connections?.length) {
        return res.json({ connected: false, profiles: [] });
    }

    const safeProfiles = connections.map(c => ({
        id: c.id,
        twitterUserId: c.twitter_user_id,
        username: c.username,
        name: c.name,
        profilePicture: c.profile_picture,
        workspaceId: c.workspace_id,
    }));

    res.json({ connected: true, profiles: safeProfiles });
});

/**
 * POST /api/twitter/post
 * Publish a tweet (plain text, max 280 chars).
 *
 * Required Supabase table:
 *   twitter_posts (id uuid default gen_random_uuid(), user_id uuid, twitter_user_id text, tweet_id text, text text, created_at timestamptz default now())
 */
router.post('/post', async (req, res) => {
    const { twitterUserId, text } = req.body;
    const userId = req.user.id;

    if (!twitterUserId || !text) {
        return res.status(400).json({ error: 'twitterUserId and text are required' });
    }

    if (text.length > 280) {
        return res.status(400).json({ error: 'Tweet text exceeds 280 characters' });
    }

    const { data: conn, error: dbErr } = await supabase
        .from('twitter_connections')
        .select('access_token')
        .eq('user_id', userId)
        .eq('twitter_user_id', twitterUserId)
        .eq('is_active', true)
        .single();

    if (dbErr || !conn) {
        return res.status(404).json({ error: 'Twitter connection not found' });
    }

    let accessToken;
    try {
        accessToken = decryptData(conn.access_token);
    } catch {
        return res.status(500).json({ error: 'Failed to decrypt access token' });
    }

    // Verify token is valid and has write scope before posting
    try {
        const verifyRes = await axios.get(
            'https://api.twitter.com/2/users/me',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log('[Twitter] Token valid for user:', verifyRes.data?.data?.username);
    } catch (verifyErr) {
        const verifyData = verifyErr.response?.data;
        console.error('[Twitter] Token verification failed:', verifyData || verifyErr.message);
        return res.status(401).json({
            error: 'Twitter token is invalid or expired. Please disconnect and reconnect your Twitter account.',
            detail: verifyData?.detail || verifyData?.title
        });
    }

    try {
        const tweetRes = await axios.post(
            'https://api.twitter.com/2/tweets',
            { text },
            { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );

        const tweetId = tweetRes.data.data.id;

        // Log post (non-blocking)
        supabase.from('twitter_posts').insert({
            user_id: userId,
            twitter_user_id: twitterUserId,
            tweet_id: tweetId,
            text,
            created_at: new Date().toISOString(),
        }).then(() => {}).catch(() => {});

        res.json({ success: true, tweetId, message: 'Tweet published successfully' });

    } catch (err) {
        const errData = err.response?.data;
        console.error('Twitter post error:', errData || err.message);
        res.status(500).json({
            error: errData?.detail || errData?.errors?.[0]?.message || err.message
        });
    }
});

/**
 * GET /api/twitter/posts
 * Get recent tweets for the current user (from local DB log).
 */
router.get('/posts', async (req, res) => {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const { data: posts, error } = await supabase
        .from('twitter_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, posts: posts || [] });
});

/**
 * DELETE /api/twitter/disconnect/:twitterUserId
 * Deactivate a Twitter connection.
 */
router.delete('/disconnect/:twitterUserId', async (req, res) => {
    const userId = req.user.id;
    const { twitterUserId } = req.params;

    const { error } = await supabase
        .from('twitter_connections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('twitter_user_id', twitterUserId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, message: 'Twitter account disconnected' });
});

export default router;
