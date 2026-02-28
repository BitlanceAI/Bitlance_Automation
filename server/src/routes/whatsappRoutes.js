import express from 'express';
import whatsappController from '../controllers/whatsappController.js';
import multer from 'multer';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer();

// Apply auth middleware to all WhatsApp routes
router.use(authenticateUser);

// ==================== BROADCAST ====================
router.post('/broadcast', upload.single('file'), whatsappController.sendBroadcast);
router.get('/history', whatsappController.getHistory);

// ==================== TEMPLATES ====================
router.get('/templates', whatsappController.getTemplates);
router.post('/templates', whatsappController.createTemplate);
router.get('/meta-templates', whatsappController.getMetaTemplates);
router.post('/sync-templates', whatsappController.syncTemplates);

// ==================== CONFIG ====================
router.post('/config', whatsappController.saveConfig);
router.get('/phone-numbers', whatsappController.getPhoneNumbers);

// ==================== TEST SEND (Debug) ====================
// POST /api/whatsapp/test-send — sends one message and returns the raw Meta API result
import axios from 'axios';
const META_API_VERSION_TS = process.env.META_API_VERSION || 'v21.0';
router.post('/test-send', async (req, res) => {
    try {
        const userId = req.user.id;
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({ error: 'to and message are required' });
        }

        const creds = await whatsappService.getMetaCredentials(userId);

        if (!creds.whatsappPhoneId) {
            return res.status(400).json({
                error: 'WhatsApp Phone Number ID is not configured.',
                hint: 'Go to Broadcast Console → Settings tab and save your Phone Number ID.'
            });
        }

        const formattedPhone = to.replace(/\D/g, '');

        try {
            const response = await axios.post(
                `https://graph.facebook.com/${META_API_VERSION_TS}/${creds.whatsappPhoneId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: formattedPhone,
                    type: 'text',
                    text: { preview_url: false, body: message }
                },
                { headers: { 'Authorization': `Bearer ${creds.accessToken}`, 'Content-Type': 'application/json' } }
            );
            return res.json({ success: true, metaResponse: response.data });
        } catch (metaErr) {
            const errData = metaErr.response?.data;
            console.error('[WhatsApp] Test Send Meta Error:', errData || metaErr.message);
            return res.status(400).json({
                success: false,
                metaError: errData || metaErr.message,
                hint: getMetaErrorHint(errData?.error?.code)
            });
        }
    } catch (error) {
        console.error('[WhatsApp] Test Send Error:', error);
        res.status(500).json({ error: error.message });
    }
});

function getMetaErrorHint(code) {
    const hints = {
        131030: 'Recipient phone number is not registered on WhatsApp.',
        131047: 'Message failed to send because >24hrs have passed since the user last messaged you. Use a template instead.',
        131021: 'Recipient phone number is invalid or not on WhatsApp.',
        190: 'Access token is expired or invalid. Reconnect your Meta account.',
        100: 'Invalid Phone Number ID or missing permission.',
        131026: 'Message undeliverable — the recipient may have blocked the sender or the number is invalid.',
        131000: 'Something went wrong on Meta side. Try again.',
    };
    return hints[code] || `Meta error code ${code}. Check https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes`;
}

export default router;
