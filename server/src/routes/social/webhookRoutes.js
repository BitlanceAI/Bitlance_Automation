import express from 'express';
import { supabase } from '../../config/supabaseClient.js';
import crypto from 'crypto';
import LinkedinService from '../../services/social/linkedinService.js';
import { decryptData } from '../../utils/encryption.js';

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
        .update(req.rawBody || JSON.stringify(req.body))
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
 * POST /webhooks/meta
 * Receive general Meta webhooks (including Facebook Page DMs and Instagram DMs)
 */
router.post('/', async (req, res) => {
    // Meta requires a 200 OK immediately
    res.sendStatus(200);

    // Verify signature to ensure it came from Meta
    if (!verifyMetaSignature(req)) {
        console.warn('[Webhook] Invalid signature on general webhook. Body was:', JSON.stringify(req.body));
        return;
    }

    try {
        const body = req.body;
        console.log('[Webhook] Received valid webhook with body object:', body.object);
        console.log('[Webhook] Full payload:', JSON.stringify(body, null, 2));
        
        // Ensure this is an event from a page or instagram object
        if (body.object === 'page' || body.object === 'instagram') {
            
            // Iterate over each entry (there may be multiple if batched)
            for (const entry of body.entry || []) {
                
                // Iterate over each messaging/changes event
                // Standard messages come under 'messaging' array
                if (entry.messaging) {
                    for (const webhookEvent of entry.messaging) {
                        console.log('[Meta DM Received]:', JSON.stringify(webhookEvent, null, 2));
                        
                        const senderPsid = webhookEvent.sender.id;
                        const recipientId = webhookEvent.recipient.id;
                        
                        // Check if it's a message
                        if (webhookEvent.message) {
                            // You can store this in your database or trigger AI reply
                            const messageText = webhookEvent.message.text;
                            console.log(`[DM] Message from ${senderPsid} to ${recipientId}: ${messageText}`);
                            
                            // Broadcast to frontend via Supabase Realtime
                            const channel = supabase.channel('meta-inbox-updates');
                            channel.send({
                                type: 'broadcast',
                                event: 'new_message',
                                payload: {
                                    id: Date.now(),
                                    platform: entry.id === recipientId ? 'facebook' : 'instagram',
                                    name: `User ${senderPsid}`,
                                    handle: `@user_${senderPsid}`,
                                    avatar: 'U',
                                    avatarBg: '#1877F2',
                                    lastMessage: messageText,
                                    time: 'Just now',
                                    unread: 1,
                                    status: 'open',
                                    messages: [
                                        { 
                                            id: Date.now(), 
                                            from: 'them', 
                                            text: messageText, 
                                            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                                        }
                                    ]
                                }
                            });
                        }
                    }
                }

                // Some new API versions or Instagram send them under 'changes'
                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.field === 'messages') {
                            console.log('[Meta DM Received (Changes API)]:', JSON.stringify(change.value, null, 2));
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('[Webhook] Error processing DM:', error);
    }
});

/**
 * POST /webhooks/meta/test-dm
 * DEV ONLY: Simulate an incoming DM to test real-time inbox
 */
router.post('/test-dm', async (req, res) => {
    const { senderName, message, platform } = req.body;
    const text = message || 'Hello, this is a test DM!';
    const name = senderName || 'Test User';
    const plat = platform || 'facebook';

    console.log(`[Test DM] Simulating DM from ${name}: ${text}`);

    try {
        const channel = supabase.channel('meta-inbox-updates');
        await channel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: {
                id: Date.now(),
                platform: plat,
                name: name,
                handle: `@${name.toLowerCase().replace(/\s+/g, '.')}`,
                avatar: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
                avatarBg: plat === 'instagram' ? '#E1306C' : '#1877F2',
                lastMessage: text,
                time: 'Just now',
                unread: 1,
                status: 'open',
                messages: [
                    {
                        id: Date.now(),
                        from: 'them',
                        text: text,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]
            }
        });

        res.json({ success: true, message: 'Test DM broadcast sent' });
    } catch (error) {
        console.error('[Test DM] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /webhooks/meta/subscribe-page
 * Subscribe a page to this app's webhooks so real DMs arrive
 */
router.post('/subscribe-page', async (req, res) => {
    const { pageId, pageAccessToken } = req.body;

    if (!pageId || !pageAccessToken) {
        return res.status(400).json({ error: 'pageId and pageAccessToken are required' });
    }

    try {
        const axios = (await import('axios')).default;
        const response = await axios.post(
            `https://graph.facebook.com/v25.0/${pageId}/subscribed_apps`,
            null,
            {
                params: {
                    subscribed_fields: 'messages,messaging_postbacks,message_reads,message_deliveries',
                    access_token: pageAccessToken
                }
            }
        );

        console.log(`[Webhook] Page ${pageId} subscribed to app webhooks:`, response.data);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('[Webhook] Page subscription error:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
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
