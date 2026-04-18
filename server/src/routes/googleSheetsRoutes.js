/**
 * src/routes/googleSheetsRoutes.js
 *
 * Routes:
 *   POST   /api/google-sheets/add          — legacy append row (service account)
 *   GET    /api/google-sheets/auth         — start OAuth2 consent flow
 *   GET    /api/google-sheets/auth-url     — returns consent URL as JSON
 *   GET    /api/google-sheets/callback     — OAuth2 callback (no auth middleware)
 *   GET    /api/google-sheets/status       — check if user has connected Google
 *   DELETE /api/google-sheets/disconnect   — remove stored OAuth tokens
 *   POST   /api/google-sheets/run-seo      — AI SEO pipeline
 *   POST   /api/google-sheets/run-blog     — Auto Blog pipeline
 */

import express from 'express';
import {
    addToSheet,
    startGoogleAuth,
    getGoogleAuthUrl,
    handleGoogleCallback,
    runSEO,
    runBlog,
} from '../controllers/googleSheetsController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { supabaseAdmin } from '../config/supabaseClient.js';

const router = express.Router();

// ── Legacy ──────────────────────────────────────────────────────────────────
router.post('/add', authenticateUser, addToSheet);

// ── OAuth Flow ───────────────────────────────────────────────────────────────
router.get('/auth', authenticateUser, startGoogleAuth);
router.get('/auth-url', getGoogleAuthUrl);
router.get('/callback', handleGoogleCallback);

// ── Connection Status ─────────────────────────────────────────────────────────
router.get('/status', authenticateUser, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('google_oauth_tokens')
            .select('user_id, refresh_token')
            .eq('user_id', req.user.id)
            .single();

        const connected = !error && !!data?.refresh_token;
        res.json({ success: true, connected });
    } catch {
        res.json({ success: true, connected: false });
    }
});

// ── Disconnect ────────────────────────────────────────────────────────────────
router.delete('/disconnect', authenticateUser, async (req, res) => {
    try {
        const { error } = await supabaseAdmin
            .from('google_oauth_tokens')
            .delete()
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ success: true, message: 'Google account disconnected' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── SEO Pipeline & Auto Blog ──────────────────────────────────────────────────
router.post('/run-seo', authenticateUser, runSEO);
router.post('/run-blog', authenticateUser, runBlog);

export default router;
