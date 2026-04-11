/**
 * DigiLocker Controller — Cashfree VRS DigiLocker Integration
 *
 * Flow:
 *   1. verifyAccount   POST /digilocker/verify-account  → check if user has DigiLocker
 *   2. createUrl       POST /digilocker                 → get consent URL
 *   3. getStatus       GET  /digilocker/status/:id      → poll consent/auth status
 *   4. getDocument     GET  /digilocker/document/:type  → fetch verified document
 */

import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabaseClient.js';

const CF_BASE = process.env.CASHFREE_VRS_BASE_URL || 'https://api.cashfree.com/verification';
const CF_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CF_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

// ── Cashfree JSON helper ─────────────────────────────────────────────────────
async function cfJson(method, path, body = null) {
    const res = await fetch(`${CF_BASE}${path}`, {
        method,
        headers: {
            'x-client-id': CF_CLIENT_ID,
            'x-client-secret': CF_CLIENT_SECRET,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error(`Cashfree ${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
    }
    return json;
}

// ── 1. Verify Account ────────────────────────────────────────────────────────
export async function verifyAccount(req, res) {
    try {
        const { mobile_number, aadhaar_number } = req.body;

        if (!mobile_number && !aadhaar_number) {
            return res.status(400).json({ success: false, error: 'mobile_number or aadhaar_number is required' });
        }
        if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
            return res.status(503).json({ success: false, error: 'Cashfree VRS credentials not configured' });
        }

        const verification_id = `DL-VA-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        const body = { verification_id };
        if (mobile_number) body.mobile_number = mobile_number;
        if (aadhaar_number) body.aadhaar_number = aadhaar_number;

        console.log('[DigiLocker] verifyAccount body:', JSON.stringify(body));
        const data = await cfJson('POST', '/digilocker/verify-account', body);
        console.log('[DigiLocker] verifyAccount response:', JSON.stringify(data));

        return res.json({ success: true, verification_id, ...data });
    } catch (err) {
        console.error('[DigiLocker] verifyAccount error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ── 2. Create Consent URL ────────────────────────────────────────────────────
export async function createUrl(req, res) {
    try {
        const { document_requested, user_flow = 'signup' } = req.body;

        if (!document_requested || !Array.isArray(document_requested) || document_requested.length === 0) {
            return res.status(400).json({ success: false, error: 'document_requested array is required' });
        }
        if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
            return res.status(503).json({ success: false, error: 'Cashfree VRS credentials not configured' });
        }

        const verification_id = `DL-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        const body = {
            verification_id,
            document_requested,
            redirect_url: `${process.env.SERVER_URL}/digilocker/complete?order_id=${verification_id}`,
            user_flow,
        };

        console.log('[DigiLocker] createUrl body:', JSON.stringify(body));
        const data = await cfJson('POST', '/digilocker', body);
        console.log('[DigiLocker] createUrl response:', JSON.stringify(data));

        const consentUrl = data.url || data.redirect_url || data.consent_url;

        // Persist to Supabase
        const { error: dbErr } = await supabaseAdmin.from('digilocker_verifications').insert({
            verification_id,
            user_id: req.user?.id || null,
            document_requested,
            status: 'PENDING',
            consent_url: consentUrl,
        });
        if (dbErr) console.error('[DigiLocker] DB insert error:', dbErr.message);

        return res.json({ success: true, verification_id, consentUrl });
    } catch (err) {
        console.error('[DigiLocker] createUrl error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ── 3. Get Status ────────────────────────────────────────────────────────────
// Statuses: PENDING | AUTHENTICATED | EXPIRED | CONSENT_DENIED
export async function getStatus(req, res) {
    try {
        const { verificationId } = req.params;

        console.log('[DigiLocker] getStatus for:', verificationId);
        const data = await cfJson('GET', `/digilocker?verification_id=${encodeURIComponent(verificationId)}`);
        console.log('[DigiLocker] getStatus response:', JSON.stringify(data));

        const status = (data.status || '').toUpperCase();

        // Update DB if status changed
        await supabaseAdmin
            .from('digilocker_verifications')
            .update({ status })
            .eq('verification_id', verificationId);

        return res.json({ success: true, verification_id: verificationId, status, raw: data });
    } catch (err) {
        console.error('[DigiLocker] getStatus error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ── 4. Get Document ──────────────────────────────────────────────────────────
// document_type: AADHAAR | PAN | DRIVING_LICENSE | VOTER_ID | PASSPORT
export async function getDocument(req, res) {
    try {
        const { documentType } = req.params;
        const { verificationId } = req.query;

        const VALID_TYPES = ['AADHAAR', 'PAN', 'DRIVING_LICENSE', 'VOTER_ID', 'PASSPORT'];
        if (!VALID_TYPES.includes(documentType?.toUpperCase())) {
            return res.status(400).json({ success: false, error: `document_type must be one of: ${VALID_TYPES.join(', ')}` });
        }
        if (!verificationId) {
            return res.status(400).json({ success: false, error: 'verificationId query param is required' });
        }

        console.log('[DigiLocker] getDocument type:', documentType, 'id:', verificationId);
        const data = await cfJson(
            'GET',
            `/digilocker/document/${documentType.toUpperCase()}?verification_id=${encodeURIComponent(verificationId)}`
        );
        console.log('[DigiLocker] getDocument response:', JSON.stringify(data));

        return res.json({ success: true, document_type: documentType.toUpperCase(), data });
    } catch (err) {
        console.error('[DigiLocker] getDocument error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ── 5. Webhook ───────────────────────────────────────────────────────────────
export async function handleWebhook(req, res) {
    try {
        // Signature verification — key is client secret, input is timestamp + rawBody
        const signature = req.headers['x-webhook-signature'];
        if (signature && CF_CLIENT_SECRET) {
            const timestamp = req.headers['x-webhook-timestamp'] || '';
            const rawBody   = req.rawBody?.toString('utf8') || '';
            const expected  = crypto
                .createHmac('sha256', CF_CLIENT_SECRET)
                .update(timestamp + rawBody)
                .digest('base64');
            if (signature !== expected) {
                console.warn('[DigiLocker] Webhook signature mismatch');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

        const { event_type, data } = req.body;

        // Test ping from dashboard — no data
        if (!data?.verification_id) {
            console.log('[DigiLocker] Webhook test/ping received:', event_type);
            return res.sendStatus(200);
        }

        const { verification_id, status } = data;
        const mapped = (status || '').toUpperCase();

        await supabaseAdmin
            .from('digilocker_verifications')
            .update({ status: mapped })
            .eq('verification_id', verification_id);

        console.log(`[DigiLocker] Webhook: event=${event_type} id=${verification_id} status=${mapped}`);
        return res.sendStatus(200);
    } catch (err) {
        console.error('[DigiLocker] Webhook error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
