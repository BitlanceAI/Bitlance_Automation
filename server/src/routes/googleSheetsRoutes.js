/**
 * src/routes/googleSheetsRoutes.js
 *
 * Routes:
 *   POST /api/google-sheets/add          — legacy append row (service account)
 *   GET  /api/google-sheets/auth         — start OAuth2 consent flow
 *   GET  /api/google-sheets/callback     — OAuth2 callback (no auth middleware — Google calls this)
 *   POST /api/google-sheets/run-seo      — AI SEO pipeline
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

const router = express.Router();

// ── Legacy ──────────────────────────────────────────────────────────────────
router.post('/add', authenticateUser, addToSheet);

// ── OAuth Flow ───────────────────────────────────────────────────────────────
// /auth requires a logged-in user so we know whose tokens to store
router.get('/auth', authenticateUser, startGoogleAuth);

// /auth-url returns the consent URL as JSON — no auth needed, userId comes as ?userId=
router.get('/auth-url', getGoogleAuthUrl);

// /callback is called BY Google — no Supabase token is present.
// The user_id is in the `state` query param (embedded in the auth URL above).
router.get('/callback', handleGoogleCallback);

// ── SEO Pipeline & Auto Blog ──────────────────────────────────────────────────
router.post('/run-seo', authenticateUser, runSEO);
router.post('/run-blog', authenticateUser, runBlog);

export default router;
