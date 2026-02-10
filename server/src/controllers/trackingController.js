import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import MetaService from '../services/metaService.js';

// Initialize Supabase (Service Role for writing events)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Meta Config
const META_PIXEL_ID = process.env.META_PIXEL_ID;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
// Optional: Test code from Meta Events Manager "Test Events" tab
const META_TEST_CODE = process.env.META_TEST_CODE;

const metaService = new MetaService(META_ACCESS_TOKEN);

/**
 * SHA-256 Hash Helper for User Data
 * Meta requires data to be normalized (lowercase) and then hashed
 */
const hashData = (data) => {
    if (!data) return null;
    const normalized = data.trim().toLowerCase();
    return crypto.createHash('sha256').update(normalized).digest('hex');
};

/**
 * Handle incoming tracking event
 */
export const trackEvent = async (req, res) => {
    try {
        const {
            eventName,
            eventTime,
            userData = {},
            customData = {},
            sourceUrl,
            eventId // Deduplication ID
        } = req.body;

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // 1. Prepare User Data for CAPI (Hash PII)
        const capiUserData = {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            em: userData.email ? [hashData(userData.email)] : undefined,
            ph: userData.phone ? [hashData(userData.phone)] : undefined,
            fn: userData.firstName ? [hashData(userData.firstName)] : undefined,
            ln: userData.lastName ? [hashData(userData.lastName)] : undefined,
            // External ID (e.g., our database User ID)
            external_id: userData.externalId ? [hashData(userData.externalId)] : undefined,
            fbc: userData.fbc, // Click ID from cookie
            fbp: userData.fbp  // Browser ID from cookie
        };

        // Remove undefined keys
        Object.keys(capiUserData).forEach(key => capiUserData[key] === undefined && delete capiUserData[key]);

        // 2. Construct CAPI Event Object
        const eventObject = {
            event_name: eventName,
            event_time: eventTime || Math.floor(Date.now() / 1000),
            user_data: capiUserData,
            custom_data: customData,
            event_source_url: sourceUrl,
            action_source: 'website',
            event_id: eventId // Critical for deduplication with Pixel events
        };

        // 3. Store in Supabase (Async - don't block response? Or await for reliability?)
        // Let's await to ensure data integrity
        const { error: dbError } = await supabase
            .from('tracking_events')
            .insert({
                event_name: eventName,
                event_time: eventObject.event_time,
                user_data: capiUserData, // Store hashed data only for privacy
                custom_data: customData,
                source_url: sourceUrl,
                action_source: 'website',
                event_id: eventId
            });

        if (dbError) {
            console.error('Supabase Tracking Log Error:', dbError);
            // Don't fail the request just because logging failed, but good to know
        }

        // 4. Send to Meta CAPI
        if (META_PIXEL_ID && META_ACCESS_TOKEN) {
            // we fire and forget or await? ideally we use a queue, but for now await
            const capiResult = await metaService.sendConversionEvent(
                META_PIXEL_ID,
                [eventObject],
                META_TEST_CODE
            );

            if (!capiResult.success) {
                console.error('Meta CAPI Failed:', capiResult.error);
            }
        }

        res.json({ success: true, eventId });

    } catch (error) {
        console.error('Tracking Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
