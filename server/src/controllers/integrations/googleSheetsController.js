/**
 * src/controllers/googleSheetsController.js
 *
 * Handles:
 *   POST  /api/google-sheets/add        — (legacy) append a row via service account
 *   GET   /api/google-sheets/auth       — start Google OAuth2 consent flow
 *   GET   /api/google-sheets/callback   — handle OAuth2 callback & store tokens
 *   POST  /api/google-sheets/run-seo    — read titles → generate SEO → write results
 */

import { google } from 'googleapis';
import { supabase, supabaseAdmin } from '../../config/supabaseClient.js';
import GoogleSheetsService from '../../services/integrations/googleSheetsService.js';
import { batchGenerateSEOTimed } from '../../services/seo/aiSeoService.js';

// ── Env var diagnostic (logged once at import time) ─────────────────────
console.log('[googleSheets] ENV check →', {
    clientId: process.env.GOOGLE_CLIENT_ID ? '✅ set' : '❌ MISSING',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ set' : '❌ MISSING',
    redirectUri: process.env.GOOGLE_REDIRECT_URI ? '✅ set' : '❌ MISSING',
});

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Build a fresh OAuth2 client from environment variables */
function _buildOAuthClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error(
            `Missing Google OAuth env vars: ${[!clientId && 'GOOGLE_CLIENT_ID', !clientSecret && 'GOOGLE_CLIENT_SECRET', !redirectUri && 'GOOGLE_REDIRECT_URI']
                .filter(Boolean).join(', ')
            }`
        );
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'openid',
    'email',
    'profile',
];

// ─────────────────────────────────────────────────────────────────────────────
// Controller: Legacy append row  (service-account path)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/google-sheets/add
 * Append a single tracking row via service-account JWT credentials.
 */
export const addToSheet = async (req, res) => {
    try {
        const userId = req.user.id;
        const { niche, keywords, title, wordpressUrl } = req.body;

        if (!niche || !title) {
            return res.status(400).json({ success: false, error: 'Niche and Title are required' });
        }

        const rowData = [
            niche,
            keywords || '',
            title,
            wordpressUrl || '',
            new Date().toLocaleDateString(),
        ];

        await GoogleSheetsService.appendRow(userId, rowData);
        res.json({ success: true, message: 'Added to Google Sheet' });
    } catch (error) {
        console.error('[googleSheetsController] addToSheet error:', error);
        res.status(500).json({ success: false, error: 'Failed to add to Google Sheet' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller: OAuth Flow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/google-sheets/auth
 * Redirect the authenticated user to Google's OAuth2 consent screen.
 * The user_id is encoded in the `state` parameter so we can link tokens
 * back to the correct account in the callback.
 */
export const startGoogleAuth = (req, res) => {
    try {
        const oauth2Client = _buildOAuthClient();
        const userId = req.user.id;

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',   // ensures we receive a refresh_token
            prompt: 'consent',        // force consent screen so refresh_token is always returned
            scope: SCOPES,
            state: userId,            // passed back verbatim in the callback
        });

        res.redirect(authUrl);
    } catch (error) {
        console.error('[googleSheetsController] startGoogleAuth error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate auth URL' });
    }
};

/**
 * GET /api/google-sheets/auth-url?userId=<uid>
 * Returns a JSON { url } pointing to Google's consent screen.
 * Does NOT require Supabase auth since the userId is passed explicitly
 * by the frontend (which already has it from its own session).
 */
export const getGoogleAuthUrl = (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId query param is required' });
        }

        const oauth2Client = _buildOAuthClient();
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: SCOPES,
            state: userId,   // echoed back in the callback so we know whose tokens to save
        });

        res.json({ success: true, url });
    } catch (error) {
        console.error('[googleSheetsController] getGoogleAuthUrl error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate auth URL' });
    }
};

/**
 * GET /api/google-sheets/callback
 * Exchange the authorization code for tokens and persist them in Supabase.
 *
 * Query params provided by Google:
 *   ?code=...&state=<userId>
 */
export const handleGoogleCallback = async (req, res) => {
    const { code, state: userId, error: oauthError } = req.query;

    if (oauthError) {
        return res.status(400).json({ success: false, error: `OAuth error: ${oauthError}` });
    }
    if (!code || !userId) {
        return res.status(400).json({ success: false, error: 'Missing code or state parameter' });
    }

    try {
        const oauth2Client = _buildOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
            console.warn('[googleSheetsController] No refresh_token received — user may need to revoke access and reconnect.');
        }

        // Upsert tokens for this user (one row per user)
        // supabaseAdmin (service-role key) is used here because this callback
        // runs server-side with no user session, so the anon client would be
        // blocked by RLS on google_oauth_tokens.
        const db = supabaseAdmin || supabase;
        const { error: dbError } = await db
            .from('google_oauth_tokens')
            .upsert(
                {
                    user_id: userId,
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token || null,
                    expiry_date: tokens.expiry_date || null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
            );

        if (dbError) throw dbError;

        // Redirect back to the client app
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${clientUrl}/dashboard/agents/seo?google_connected=true`);
    } catch (error) {
        console.error('[googleSheetsController] handleGoogleCallback error:', error.message, error.response?.data || '');
        // Return the real error message so it's easier to diagnose
        res.status(500).json({
            success: false,
            error: 'Failed to exchange authorization code',
            detail: error.message,          // visible in browser / network tab
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller: Run SEO Pipeline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/google-sheets/run-seo
 *
 * Body:
 * {
 *   "sheetId":   "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
 *   "inputCol":  "A",   // optional — column to read titles from (default A)
 *   "outputCol": "B",   // optional — column to write SEO results to (default B)
 *   "inputRange":  "Sheet1!A2:A",  // optional — full A1 range override
 *   "outputRange": "Sheet1!B2:B"   // optional — full A1 range override
 * }
 *
 * Flow:
 *   1. Read titles from inputCol / inputRange
 *   2. Filter out empty rows
 *   3. Run each title through generateSEO()
 *   4. Write results to outputCol / outputRange
 *   5. Return summary JSON
 */
export const runSEO = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            sheetId,
            inputCol,
            outputCol,
            inputRange,
            outputRange,
        } = req.body;

        if (!sheetId) {
            return res.status(400).json({ success: false, error: '"sheetId" is required' });
        }

        // ── Step 1: Read titles ───────────────────────────────────────────
        const titles = await GoogleSheetsService.readTitles(
            userId,
            sheetId,
            inputRange,   // explicit override or undefined (service uses default)
            inputCol      // dynamic column override or undefined
        );

        if (!titles.length) {
            return res.json({
                success: true,
                message: 'No titles found in the specified range',
                processed: 0,
                results: [],
            });
        }

        // ── Step 2: AI processing (with per-row timing) ───────────────────
        const timedResults = await batchGenerateSEOTimed(titles);
        const seoResults = timedResults.map((r) => r.result);
        const timings = timedResults.map((r) => r.timeTakenSec); // e.g. "2.34"

        // ── Step 3: Write SEO results back to sheet ───────────────────────
        // Google Sheets expects a 2-D array: each row is [value]
        const writeValues = seoResults.map((result) => [result]);

        await GoogleSheetsService.writeOutput(
            userId,
            sheetId,
            writeValues,
            outputRange,  // explicit override or undefined
            outputCol     // dynamic column override or undefined
        );

        // ── Step 4: Mark rows as complete ────────────────────────────────
        await GoogleSheetsService.markComplete(userId, sheetId, titles.length, outputCol);

        // ── Step 5: Write generation timings to the next column ──────────
        await GoogleSheetsService.writeTimings(userId, sheetId, timings, outputCol);

        // ── Step 6: Return summary ────────────────────────────────────────
        res.json({
            success: true,
            processed: titles.length,
            results: titles.map((title, i) => ({
                input: title,
                output: seoResults[i],
                timeTakenSec: timings[i],
            })),
        });
    } catch (error) {
        console.error('[googleSheetsController] runSEO error:', error);
        res.status(500).json({ success: false, error: error.message || 'SEO pipeline failed' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller: Run Auto Blog Pipeline
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/google-sheets/run-blog
 * Flow:
 *   1. Read titles from inputCol
 *   2. Run each title through generateAndSaveArticleInternal (full blog gen)
 *   3. Write "✅ Blog Generated" to outputCol
 *   4. Write timing back 
 */
export const runBlog = async (req, res) => {
    try {
        const userId = req.user.id;
        const token = req.token; // From authMiddleware
        const {
            sheetId,
            inputCol,
            outputCol,
            inputRange,
            outputRange,
            language,
            style,
            length,
            audience
        } = req.body;

        if (!sheetId) {
            return res.status(400).json({ success: false, error: '"sheetId" is required' });
        }

        const titles = await GoogleSheetsService.readTitles(userId, sheetId, inputRange, inputCol);

        if (!titles.length) {
            return res.json({
                success: true,
                message: 'No titles found in the specified range',
                processed: 0,
                results: [],
            });
        }

        const results = [];
        const seoResults = [];
        const timings = [];

        // For blog generation, we import the helper from articleController
        // Since it's a dynamic backend requirement, let's process sequentially to avoid timeout/rate limits
        const { generateAndSaveArticleInternal } = await import('./articleController.js');

        for (let i = 0; i < titles.length; i++) {
            const title = titles[i];
            const startStr = Date.now();
            let outputMsg = "❌ Failed";

            try {
                const blogData = await generateAndSaveArticleInternal({
                    userId,
                    token,
                    topic: title,
                    language: language || 'English',
                    style: style || 'Professional',
                    length: length || 'Medium',
                    audience: audience || 'General',
                    is_published: true // auto-save to db
                });
                outputMsg = `✅ Blog Generated (ID: ${blogData.id || blogData.slug || 'Unknown'})`;
            } catch (err) {
                console.error(`[runBlog] Failed for title "${title}":`, err.message);
                outputMsg = `❌ Error: ${err.message}`;
            }

            const takenSec = ((Date.now() - startStr) / 1000).toFixed(2);
            seoResults.push(outputMsg);
            timings.push(takenSec);

            results.push({
                input: title,
                output: outputMsg,
                timeTakenSec: takenSec,
            });
        }

        // Write results to outputCol
        const writeValues = seoResults.map((msg) => [msg]);
        await GoogleSheetsService.writeOutput(userId, sheetId, writeValues, outputRange, outputCol);

        // Mark rows as complete
        await GoogleSheetsService.markComplete(userId, sheetId, titles.length, outputCol);

        // Write generation timings
        await GoogleSheetsService.writeTimings(userId, sheetId, timings, outputCol);

        res.json({
            success: true,
            processed: titles.length,
            results,
        });

    } catch (error) {
        console.error('[googleSheetsController] runBlog error:', error);
        res.status(500).json({ success: false, error: error.message || 'Auto Blog pipeline failed' });
    }
};
