import express from 'express';
import { getAllUsers, addUser, addUserCredits, sendRemarketingEmails, getRenderLogs } from '../../controllers/admin/adminController.js';
import {
    runWelcomeSequence,
    runNurtureSequence,
    runReengagementSequence,
    sendDueEmails,
    unsubscribeEmail,
} from '../../services/email/emailSequenceService.js';
import { supabaseAdmin } from '../../config/supabaseClient.js';

// In a real app, adding a strict "isAdmin" middleware here is recommended
// For now, we assume the dashboard uses this route and is protected by general auth or is internal

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/users', addUser);
router.post('/users/:id/credits', addUserCredits);
router.post('/remarketing/email', sendRemarketingEmails);
router.get('/logs/render', getRenderLogs);

// ── Email Sequence Test / Admin Endpoints ─────────────────────────────────────

// POST /api/admin/email-sequences/trigger
// Manually run the full sequence cycle (enrol + send due emails)
router.post('/email-sequences/trigger', async (req, res) => {
    try {
        await runWelcomeSequence();
        await runNurtureSequence();
        await runReengagementSequence();
        await sendDueEmails();
        res.json({ success: true, message: 'Email sequence cycle completed. Check server logs.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/admin/email-sequences/enrol
// Manually enrol a specific email into a sequence (for testing)
// Body: { email, sequence_type: 'welcome'|'nurture'|'reengagement', name }
router.post('/email-sequences/enrol', async (req, res) => {
    try {
        const { email, sequence_type, name } = req.body;
        if (!email || !sequence_type) {
            return res.status(400).json({ error: 'email and sequence_type are required' });
        }
        const { error } = await supabaseAdmin
            .from('email_sequences')
            .upsert({
                email,
                sequence_type,
                current_step: 0,
                next_send_at: new Date().toISOString(),
                completed: false,
                unsubscribed: false,
                metadata: { name: name || email.split('@')[0] },
            }, { onConflict: 'email,sequence_type' });

        if (error) throw error;
        res.json({ success: true, message: `Enrolled ${email} in ${sequence_type} sequence. Run /trigger to send.` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/admin/email-sequences/list
// List all active sequence entries (for verifying state)
router.get('/email-sequences/list', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('email_sequences')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) throw error;
        res.json({ success: true, sequences: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/admin/email-sequences/reset
// Delete all test sequences (clean slate for re-testing)
// Body: { email } — optional, omit to delete ALL
router.delete('/email-sequences/reset', async (req, res) => {
    try {
        const { email } = req.body || {};
        let query = supabaseAdmin.from('email_sequences').delete();
        if (email) {
            query = query.eq('email', email);
        } else {
            query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
        }
        const { error } = await query;
        if (error) throw error;
        res.json({ success: true, message: email ? `Reset sequences for ${email}` : 'All sequences deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/admin/email-sequences/import-seo-leads
// Import emails and names from Google Sheet and bulk enroll in seo_marketing sequence
// Body: { sheetId, emailColumn, nameColumn } — column indices or names
// Returns: { success: true, enrolled: number, skipped: number, errors: array }
router.post('/email-sequences/import-seo-leads', async (req, res) => {
    try {
        const { sheetId, emailColumn = 'email', nameColumn = 'name', userId } = req.body;

        if (!sheetId) {
            return res.status(400).json({ error: 'sheetId is required' });
        }

        // Read emails and names from Google Sheet
        // First, get the sheet data
        const { google } = await import('googleapis');
        const sheets = google.sheets('v4');

        // Get user's Google credentials from user_settings
        const { data: settings, error: settingsError } = await supabaseAdmin
            .from('user_settings')
            .select('google_access_token, google_refresh_token')
            .eq('user_id', userId || req.user?.id)
            .single();

        if (settingsError || !settings?.google_access_token) {
            return res.status(400).json({ error: 'Google Sheets credentials not found. Please connect Google Sheets first.' });
        }

        // Create auth client
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({
            access_token: settings.google_access_token,
            refresh_token: settings.google_refresh_token,
        });

        // Read the sheet
        const response = await sheets.spreadsheets.values.get({
            auth: oauth2Client,
            spreadsheetId: sheetId,
            range: 'Sheet1!A:Z', // Read up to 26 columns
        });

        const rows = response.data.values || [];
        if (rows.length < 2) {
            return res.status(400).json({ error: 'Sheet has no data rows' });
        }

        const headers = rows[0].map(h => h?.toLowerCase?.() || '');
        const emailIdx = typeof emailColumn === 'number' ? emailColumn : headers.indexOf(emailColumn.toLowerCase());
        const nameIdx = typeof nameColumn === 'number' ? nameColumn : headers.indexOf(nameColumn.toLowerCase());

        if (emailIdx === -1) {
            return res.status(400).json({ error: `Column '${emailColumn}' not found in sheet` });
        }

        // Process rows and enroll in seo_marketing sequence
        const enrolled = [];
        const skipped = [];
        const errors = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const email = row[emailIdx]?.trim?.();
            const name = nameIdx >= 0 ? row[nameIdx]?.trim?.() : email?.split('@')[0];

            if (!email) {
                skipped.push({ row: i + 1, reason: 'Empty email' });
                continue;
            }

            try {
                const { error } = await supabaseAdmin
                    .from('email_sequences')
                    .upsert({
                        email,
                        sequence_type: 'seo_marketing',
                        current_step: 0,
                        next_send_at: new Date().toISOString(),
                        completed: false,
                        unsubscribed: false,
                        metadata: { name: name || email.split('@')[0] },
                    }, { onConflict: 'email,sequence_type', ignoreDuplicates: false });

                if (error) {
                    errors.push({ email, error: error.message });
                    skipped.push({ row: i + 1, email, reason: error.message });
                } else {
                    enrolled.push(email);
                }
            } catch (err) {
                errors.push({ email, error: err.message });
                skipped.push({ row: i + 1, email, reason: err.message });
            }
        }

        res.json({
            success: true,
            message: `Imported ${enrolled.length} emails for SEO marketing sequence`,
            enrolled: enrolled.length,
            skipped: skipped.length,
            total: rows.length - 1,
            enrolledEmails: enrolled,
            skippedRows: skipped,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err) {
        console.error('[AdminRoutes] import-seo-leads error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
