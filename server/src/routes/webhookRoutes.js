import express from 'express';
import { supabase } from '../config/supabaseClient.js';
import crypto from 'crypto';
import LinkedinService from '../services/linkedinService.js';
import { decryptData } from '../utils/encryption.js';

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
 * Handles both /webhooks/meta/ and /webhooks/meta/whatsapp
 */
function handleVerification(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
        console.log('[Webhook] Verified');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
}

router.get('/', handleVerification);
router.get('/whatsapp', handleVerification);

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

/**
 * POST /webhooks/meta/whatsapp
 * Receive incoming WhatsApp messages (button replies for LinkedIn post approval)
 */
router.post('/whatsapp', async (req, res) => {
    // Respond 200 immediately — Meta requires a fast acknowledgement
    res.sendStatus(200);

    try {
        const entry = req.body.entry?.[0];
        if (!entry) return;

        const change = entry.changes?.[0];
        if (change?.field !== 'messages') return;

        const messages = change.value?.messages;
        if (!messages?.length) return;

        for (const message of messages) {
            if (message.type !== 'button') continue;

            const fromPhone = message.from; // e.g. "919876543210"
            const payload = message.button?.payload; // 'APPROVED' or 'DISAPPROVED'

            if (!['APPROVED', 'DISAPPROVED'].includes(payload)) continue;

            console.log(`[WA Approval] ${payload} from ${fromPhone}`);

            // Find the most recent pending approval for this phone
            const { data: pending, error: fetchErr } = await supabase
                .from('linkedin_pending_approvals')
                .select('*')
                .eq('approver_phone', fromPhone)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (fetchErr || !pending) {
                console.warn('[WA Approval] No pending approval found for', fromPhone);
                continue;
            }

            if (payload === 'APPROVED') {
                // Fetch LinkedIn credentials for this user + profile
                const { data: connection } = await supabase
                    .from('linkedin_connections')
                    .select('access_token')
                    .eq('user_id', pending.user_id)
                    .eq('profile_id', pending.profile_id)
                    .eq('is_active', true)
                    .single();

                if (connection) {
                    try {
                        const accessToken = decryptData(connection.access_token);
                        const linkedinService = new LinkedinService(accessToken);
                        const media = pending.asset_urn && pending.media_category
                            ? { assetUrn: pending.asset_urn, mediaCategory: pending.media_category }
                            : null;

                        const result = await linkedinService.createPost(
                            pending.profile_id,
                            pending.text,
                            pending.visibility,
                            media
                        );

                        if (result.success) {
                            console.log('[WA Approval] Auto-posted to LinkedIn:', result.postId);
                            // Record in post history
                            await supabase.from('linkedin_posts').insert({
                                user_id: pending.user_id,
                                profile_id: pending.profile_id,
                                post_id: result.postId,
                                text: pending.text,
                                media_category: pending.media_category || null,
                                visibility: pending.visibility,
                                created_at: new Date().toISOString()
                            });
                        } else {
                            console.error('[WA Approval] LinkedIn post failed:', result.error);
                        }
                    } catch (postErr) {
                        console.error('[WA Approval] Error posting to LinkedIn:', postErr.message);
                    }
                } else {
                    console.warn('[WA Approval] LinkedIn connection not found for user', pending.user_id);
                }

                await supabase
                    .from('linkedin_pending_approvals')
                    .update({ status: 'approved', updated_at: new Date().toISOString() })
                    .eq('id', pending.id);

            } else {
                await supabase
                    .from('linkedin_pending_approvals')
                    .update({ status: 'disapproved', updated_at: new Date().toISOString() })
                    .eq('id', pending.id);

                console.log('[WA Approval] Post disapproved for user', pending.user_id);
            }
        }
    } catch (err) {
        console.error('[WA Approval] Webhook error:', err.message);
    }
});

export default router;
