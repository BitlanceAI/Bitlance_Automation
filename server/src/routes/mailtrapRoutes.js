import express from 'express';
import { sendMailtrapEmail } from '../services/mailtrapService.js';

const router = express.Router();

/**
 * POST /api/mailtrap/send
 * Body: { to, subject, html, text? }
 * Send a one-off transactional email via Mailtrap.
 */
router.post('/send', async (req, res) => {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ success: false, error: '`to`, `subject`, and `html` are required.' });
    }

    const result = await sendMailtrapEmail(to, subject, html, text);

    if (result.success) {
        return res.json({ success: true, messageId: result.messageId });
    }
    return res.status(500).json({ success: false, error: result.error });
});

export default router;
