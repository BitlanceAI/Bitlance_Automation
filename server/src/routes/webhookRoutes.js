import express from 'express';
import { supabase } from '../config/supabaseClient.js';
import crypto from 'crypto';

const router = express.Router();

// Meta App Secret for signature verification (set in .env)
const META_APP_SECRET = process.env.META_APP_SECRET;

/**
 * Verify Meta Webhook Signature (X-Hub-Signature-256)
 */
function verifyMetaSignature(req) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature || !META_APP_SECRET) return false;

    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', META_APP_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Webhook Verification (GET) - Required by Meta
 */
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify token should match your configured VERIFY_TOKEN
    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
        console.log('[Webhook] Verified');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

/**
 * POST /webhooks/meta/leads
 * Receive Lead Gen form submissions from Meta
 */
router.post('/leads', async (req, res) => {
    console.log('[Webhook] Lead Received:', JSON.stringify(req.body).slice(0, 500));

    if (!verifyMetaSignature(req)) {
        console.warn('[Webhook] Invalid signature');
        return res.sendStatus(403);
    }

    try {
        const entry = req.body.entry?.[0];
        if (!entry) return res.sendStatus(200);

        for (const change of entry.changes || []) {
            if (change.field === 'leadgen') {
                const leadgenId = change.value.leadgen_id;
                const formId = change.value.form_id;
                const pageId = change.value.page_id;
                const adId = change.value.ad_id;
                const createdTime = change.value.created_time;

                // Store lead event in Supabase
                // Note: To get actual lead data, you need to call Graph API: GET /{leadgen_id}
                const { error } = await supabase
                    .from('leads')
                    .insert({
                        meta_leadgen_id: leadgenId,
                        meta_form_id: formId,
                        meta_page_id: pageId,
                        meta_ad_id: adId,
                        created_time: new Date(createdTime * 1000).toISOString(),
                        status: 'NEW',
                        raw_data: change.value
                    });

                if (error) console.error('[Webhook] Supabase insert error:', error);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('[Webhook] Lead processing error:', error);
        res.sendStatus(500);
    }
});

/**
 * POST /webhooks/meta/events
 * Receive Pixel/Conversion events from Meta (for debugging)
 */
router.post('/events', async (req, res) => {
    console.log('[Webhook] Event Received:', JSON.stringify(req.body).slice(0, 500));

    if (!verifyMetaSignature(req)) {
        return res.sendStatus(403);
    }

    try {
        // Store raw event for analysis
        const { error } = await supabase
            .from('meta_webhook_logs')
            .insert({
                event_type: 'pixel_event',
                payload: req.body,
                received_at: new Date().toISOString()
            });

        if (error) console.error('[Webhook] Log error:', error);
        res.sendStatus(200);
    } catch (error) {
        console.error('[Webhook] Event processing error:', error);
        res.sendStatus(500);
    }
});

/**
 * POST /webhooks/meta/conversions
 * Track conversion events (Purchase, AddToCart, etc.)
 */
router.post('/conversions', async (req, res) => {
    console.log('[Webhook] Conversion Received:', JSON.stringify(req.body).slice(0, 500));

    if (!verifyMetaSignature(req)) {
        return res.sendStatus(403);
    }

    try {
        const entry = req.body.entry?.[0];
        if (!entry) return res.sendStatus(200);

        for (const change of entry.changes || []) {
            const { error } = await supabase
                .from('conversions')
                .insert({
                    event_name: change.value?.event_name || 'UNKNOWN',
                    event_time: change.value?.event_time,
                    user_data: change.value?.user_data || {},
                    custom_data: change.value?.custom_data || {},
                    raw_payload: change.value
                });

            if (error) console.error('[Webhook] Conversion insert error:', error);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('[Webhook] Conversion processing error:', error);
        res.sendStatus(500);
    }
});

export default router;
