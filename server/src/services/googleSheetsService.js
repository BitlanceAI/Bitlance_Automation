/**
 * src/services/googleSheetsService.js
 *
 * Google Sheets Service — handles:
 *   • JWT auth via service-account credentials stored in Supabase user_settings
 *   • OAuth2 auth via tokens stored for users who connected via /api/google-sheets/auth
 *   • readTitles()  — read a column of titles from a sheet
 *   • writeOutput() — write processed values back to a sheet
 *   • appendRow()   — legacy helper used by existing controller
 */

import { google } from 'googleapis';
import { supabase, supabaseAdmin } from '../config/supabaseClient.js';

// Use admin client for server-side reads/writes that run outside a user session
const db = supabaseAdmin || supabase;
import { decryptData } from '../utils/encryption.js';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a Google OAuth2 client pre-loaded with a user's stored tokens.
 * Tokens are fetched from `google_oauth_tokens` table in Supabase.
 * @param {string} userId
 * @returns {import('googleapis').Auth.OAuth2Client}
 */
async function _getOAuthClient(userId) {
    const { data, error } = await db
        .from('google_oauth_tokens')
        .select('access_token, refresh_token, expiry_date')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        throw new Error('Google OAuth tokens not found. Please connect your Google account first via GET /api/google-sheets/auth');
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: data.expiry_date,
    });

    // Automatically persist refreshed tokens back to the DB
    oauth2Client.on('tokens', async (tokens) => {
        const update = {};
        if (tokens.access_token) update.access_token = tokens.access_token;
        if (tokens.expiry_date) update.expiry_date = tokens.expiry_date;
        if (tokens.refresh_token) update.refresh_token = tokens.refresh_token;

        if (Object.keys(update).length) {
            await db
                .from('google_oauth_tokens')
                .upsert({ user_id: userId, ...update }, { onConflict: 'user_id' });
        }
    });

    return oauth2Client;
}

/**
 * Build a JWT auth client via service-account credentials (legacy path).
 * Used by appendRow() for the existing sheet-tracking feature.
 * @param {string} userId
 * @returns {{ auth: import('googleapis').Auth.JWT, spreadsheetId: string }}
 */
async function _getJWTAuthClient(userId) {
    const { data: settings, error } = await supabase
        .from('user_settings')
        .select('google_sheet_id, google_service_email, google_private_key')
        .eq('user_id', userId)
        .single();

    if (error || !settings) {
        throw new Error('Google Sheets service-account settings not found for this user');
    }

    const privateKey = decryptData(settings.google_private_key);
    if (!privateKey) throw new Error('Failed to decrypt private key');

    const auth = new google.auth.JWT(
        settings.google_service_email,
        null,
        privateKey.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    return { auth, spreadsheetId: settings.google_sheet_id };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the next column letter after the given one.
 * Works for single-letter columns A-Z (e.g. 'B' → 'C', 'Z' → 'AA').
 * @param {string} col - Column letter (e.g. "B")
 * @returns {string}
 */
function _nextColumn(col) {
    const upper = col.toUpperCase();
    const last = upper.charCodeAt(upper.length - 1);
    if (last < 90) {
        // simple increment: B→C, Y→Z
        return upper.slice(0, -1) + String.fromCharCode(last + 1);
    }
    // Z → AA, AZ → BA, etc.
    return _nextColumn(upper.slice(0, -1) || '@') + 'A';
}

// ─────────────────────────────────────────────────────────────────────────────
// GoogleSheetsService
// ─────────────────────────────────────────────────────────────────────────────

class GoogleSheetsService {

    // ── OAuth-based read/write ─────────────────────────────────────────────

    /**
     * Read a column of values from a sheet.
     *
     * @param {string} userId       - Supabase user id (used to retrieve OAuth tokens)
     * @param {string} sheetId      - Google Spreadsheet ID
     * @param {string} [range]      - A1 notation range. Defaults to "Sheet1!A2:A"
     * @param {string} [inputCol]   - Override column letter for dynamic mapping (e.g. "B")
     * @returns {Promise<string[]>} - Flat array of non-empty string values
     */
    async readTitles(userId, sheetId, range, inputCol) {
        const auth = await _getOAuthClient(userId);
        const sheets = google.sheets({ version: 'v4', auth });

        // Dynamic column mapping: if inputCol is given, override the range
        const resolvedRange = inputCol
            ? `Sheet1!${inputCol}2:${inputCol}`
            : (range || 'Sheet1!A2:A');

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: resolvedRange,
        });

        const rows = response.data.values || [];

        // Flatten, remove empty/null cells
        return rows
            .map((row) => (row[0] != null ? String(row[0]).trim() : null))
            .filter(Boolean);
    }

    /**
     * Write processed values back to a sheet (overwrites the target range).
     *
     * @param {string}   userId      - Supabase user id
     * @param {string}   sheetId     - Google Spreadsheet ID
     * @param {string[][]} values    - 2-D array of values to write
     * @param {string}   [range]     - A1 notation range. Defaults to "Sheet1!B2:B"
     * @param {string}   [outputCol] - Override column letter for dynamic mapping (e.g. "C")
     * @returns {Promise<void>}
     */
    async writeOutput(userId, sheetId, values, range, outputCol) {
        const auth = await _getOAuthClient(userId);
        const sheets = google.sheets({ version: 'v4', auth });

        const resolvedRange = outputCol
            ? `Sheet1!${outputCol}2:${outputCol}`
            : (range || 'Sheet1!B2:B');

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: resolvedRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
    }

    /**
     * Write "✅ Complete" to the column immediately after outputCol for each
     * processed row, so users can see at a glance which rows are done.
     *
     * @param {string} userId      - Supabase user id
     * @param {string} sheetId     - Google Spreadsheet ID
     * @param {number} rowCount    - Number of rows that were processed
     * @param {string} [outputCol] - The column that SEO output was written to (default "B").
     *                               The status column will be the next column (e.g. "B" → "C").
     * @param {string} [statusCol] - Explicit override for the status column letter.
     */
    async markComplete(userId, sheetId, rowCount, outputCol, statusCol) {
        const auth = await _getOAuthClient(userId);
        const sheets = google.sheets({ version: 'v4', auth });

        // Derive status column: next letter after outputCol, or explicit override
        const resolvedStatusCol = statusCol || _nextColumn(outputCol || 'B');
        const range = `Sheet1!${resolvedStatusCol}2:${resolvedStatusCol}${rowCount + 1}`;

        const values = Array.from({ length: rowCount }, () => ['✅ Complete']);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
    }

    /**
     * Write per-row generation times (e.g. "2.34s") to the sheet.
     * Placed two columns after outputCol so the layout reads:
     *   [Input] | [SEO Output] | [✅ Complete] | [⏱ Gen Time]
     *
     * @param {string}   userId      - Supabase user id
     * @param {string}   sheetId     - Google Spreadsheet ID
     * @param {string[]} timings     - Array of time strings, e.g. ["1.23", "4.56"]
     * @param {string}   [outputCol] - The SEO output column (default "B").
     *                                 Timings go two columns further (e.g. "B" → "D").
     * @param {string}   [timingCol] - Explicit override for the timing column letter.
     */
    async writeTimings(userId, sheetId, timings, outputCol, timingCol) {
        if (!timings || !timings.length) return;

        const auth = await _getOAuthClient(userId);
        const sheets = google.sheets({ version: 'v4', auth });

        // Two columns after outputCol (status is +1, timings are +2)
        const resolvedTimingCol = timingCol || _nextColumn(_nextColumn(outputCol || 'B'));
        const range = `Sheet1!${resolvedTimingCol}2:${resolvedTimingCol}${timings.length + 1}`;

        const values = timings.map((sec) => [`⏱ ${sec}s`]);

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
    }

    // ── Legacy service-account path ────────────────────────────────────────

    /**
     * Append a single row using service-account JWT credentials.
     * Kept for backwards compatibility with the existing /api/google-sheets/add route.
     *
     * @param {string}   userId  - Supabase user id
     * @param {any[]}    rowData - Array of cell values
     */
    async appendRow(userId, rowData) {
        const { auth, spreadsheetId } = await _getJWTAuthClient(userId);
        const sheets = google.sheets({ version: 'v4', auth });

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [rowData] },
        });
    }
}

export default new GoogleSheetsService();
