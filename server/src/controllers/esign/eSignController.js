/**
 * eSign Controller — Cashfree VRS Aadhaar OTP e-Sign
 *
 * Cashfree VRS API (v2):
 *   Base: https://sandbox.cashfree.com/verification  (sandbox)
 *         https://api.cashfree.com/verification       (production)
 *
 *   POST multipart /esignature/document  → upload PDF → document_id
 *   POST json      /esignature           → create request → sign_url
 *   GET            /esignature?verification_id=X → status
 */

import crypto from 'crypto';
import FormData from 'form-data';
import { supabaseAdmin } from '../../config/supabaseClient.js';

const CF_BASE = process.env.CASHFREE_VRS_BASE_URL || 'https://sandbox.cashfree.com/verification';
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

// ── Cashfree multipart helper (PDF upload) ───────────────────────────────────
async function cfUploadPdf(pdfBase64) {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const form = new FormData();
    form.append('document', pdfBuffer, {
        filename: 'agreement.pdf',
        contentType: 'application/pdf',
    });

    // Use getBuffer() so native fetch receives a Buffer, not a Node.js stream
    const res = await fetch(`${CF_BASE}/esignature/document`, {
        method: 'POST',
        headers: {
            'x-client-id': CF_CLIENT_ID,
            'x-client-secret': CF_CLIENT_SECRET,
            Accept: 'application/json',
            ...form.getHeaders(),
        },
        body: form.getBuffer(),
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error(`Cashfree PDF upload → ${res.status}: ${JSON.stringify(json)}`);
    }
    return json; // { document_id: <int>, ... }
}

// ── 1. Create sign request ───────────────────────────────────────────────────
export async function createSignRequest(req, res) {
    try {
        const { name, email, phone, pdfBase64 } = req.body;

        if (!name || !email || !phone || !pdfBase64) {
            return res.status(400).json({ success: false, error: 'name, email, phone, pdfBase64 are required' });
        }
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ success: false, error: 'phone must be 10 digits' });
        }
        if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
            return res.status(503).json({ success: false, error: 'Cashfree VRS credentials not configured' });
        }

        const verificationId = `ESIGN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Step A — upload PDF
        const uploadRes = await cfUploadPdf(pdfBase64);
        const documentId = uploadRes.document_id;

        // Step B — create eSign request (Aadhaar OTP)
        const esignBody = {
            verification_id: verificationId,
            document_id: documentId,
            auth_type: 'AADHAAR',
            notification_modes: ['email'],
            expiry_in_days: '1',
            capture_location: false,
            redirect_url: `${process.env.CLIENT_URL}/esign/complete?order_id=${verificationId}`,
            signers: [
                {
                    name,
                    email,
                    phone,
                    sequence: 1,
                    sign_positions: [
                        {
                            page: 1,
                            top_left_x_coordinate: 100,
                            bottom_right_x_coordinate: 300,
                            top_left_y_coordinate: 680,
                            bottom_right_y_coordinate: 720,
                        },
                    ],
                },
            ],
        };
        console.log('[eSign] POST /esignature body:', JSON.stringify(esignBody));
        const signRes = await cfJson('POST', '/esignature', esignBody);
        console.log('[eSign] POST /esignature response:', JSON.stringify(signRes));

        const signUrl = signRes.signing_link;

        const referenceId = signRes.reference_id;

        // Persist to Supabase
        const { error: dbErr } = await supabaseAdmin.from('esign_agreements').insert({
            order_id: verificationId,
            reference_id: referenceId ? String(referenceId) : null,
            user_id: req.user?.id || null,
            name,
            email,
            phone,
            status: 'PENDING',
            sign_url: signUrl,
            pdf_doc_id: String(documentId),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        if (dbErr) console.error('[eSign] DB insert error:', dbErr.message);

        return res.json({ success: true, orderId: verificationId, signUrl });
    } catch (err) {
        console.error('[eSign] createSignRequest error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ── 2. Poll status ───────────────────────────────────────────────────────────
export async function getSignStatus(req, res) {
    try {
        const { orderId } = req.params;

        // Check DB first
        const { data: record } = await supabaseAdmin
            .from('esign_agreements')
            .select('status, signed_pdf_url, signed_at, sign_url, expires_at, reference_id')
            .eq('order_id', orderId)
            .single();

        if (!record) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        if (record.status === 'SIGNED' || record.status === 'FAILED') {
            return res.json({ success: true, ...record });
        }

        // Fetch live from Cashfree — use both verification_id and reference_id if available
        let cfUrl = `/esignature?verification_id=${encodeURIComponent(orderId)}`;
        if (record.reference_id) cfUrl += `&reference_id=${encodeURIComponent(record.reference_id)}`;
        const cfRes = await cfJson('GET', cfUrl);

        // Cashfree statuses: IN_PROGRESS, SUCCESS, FAILED, EXPIRED
        const rawStatus = (cfRes.status || '').toUpperCase();
        const status = rawStatus === 'SUCCESS' ? 'SIGNED'
            : rawStatus === 'FAILED' ? 'FAILED'
            : rawStatus === 'EXPIRED' ? 'EXPIRED'
            : 'PENDING';

        const signedPdfUrl = cfRes.signed_doc_url || null;

        if (status !== record.status) {
            await supabaseAdmin.from('esign_agreements').update({
                status,
                signed_pdf_url: signedPdfUrl,
                signed_at: status === 'SIGNED' ? new Date().toISOString() : null,
            }).eq('order_id', orderId);
        }

        return res.json({ success: true, status, signUrl: record.sign_url, signedPdfUrl, expiresAt: record.expires_at });
    } catch (err) {
        console.error('[eSign] getSignStatus error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ── 3. Webhook ───────────────────────────────────────────────────────────────
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
                console.warn('[eSign] Webhook signature mismatch');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

        // Payload is nested under data
        const { event_type, data } = req.body;
        if (!data?.verification_id) {
            console.log('[eSign] Webhook test/ping received:', event_type);
            return res.sendStatus(200);
        }

        const { verification_id, status, signed_doc_url } = data;

        const mapped = (status || '').toUpperCase() === 'SUCCESS'  ? 'SIGNED'
            :          (status || '').toUpperCase() === 'FAILURE'  ? 'FAILED'
            :          (status || '').toUpperCase() === 'EXPIRED'  ? 'EXPIRED'
            : 'PENDING';

        await supabaseAdmin.from('esign_agreements').update({
            status: mapped,
            signed_pdf_url: signed_doc_url || null,
            signed_at: mapped === 'SIGNED' ? new Date().toISOString() : null,
        }).eq('order_id', verification_id);

        console.log(`[eSign] Webhook: event=${event_type} id=${verification_id} status=${mapped}`);
        return res.sendStatus(200);
    } catch (err) {
        console.error('[eSign] Webhook error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

// ── 4. List agreements ───────────────────────────────────────────────────────
export async function myAgreements(req, res) {
    try {
        const { data, error } = await supabaseAdmin
            .from('esign_agreements')
            .select('order_id, name, email, status, signed_pdf_url, created_at, signed_at')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return res.json({ success: true, agreements: data });
    } catch (err) {
        console.error('[eSign] myAgreements error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}
