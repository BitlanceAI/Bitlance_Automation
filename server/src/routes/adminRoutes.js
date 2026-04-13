import express from 'express';
import { getAllUsers, addUser, addUserCredits, sendRemarketingEmails, getRenderLogs } from '../controllers/adminController.js';
import {
    runWelcomeSequence,
    runNurtureSequence,
    runReengagementSequence,
    sendDueEmails,
    unsubscribeEmail,
} from '../services/emailSequenceService.js';
import { supabaseAdmin } from '../config/supabaseClient.js';

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

export default router;
