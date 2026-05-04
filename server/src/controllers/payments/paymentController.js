/**
 * Payment Controller — Cashfree Payment Gateway (PG)
 *
 * Base URL: https://api.cashfree.com/pg   (production)
 *           https://sandbox.cashfree.com/pg (sandbox)
 */

import crypto from 'crypto';
import { supabaseAdmin } from '../../config/supabaseClient.js';

const PG_BASE = process.env.CASHFREE_PG_BASE_URL || 'https://sandbox.cashfree.com/pg';
const CF_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CF_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CF_API_VERSION = '2023-08-01';


async function pgJson(method, path, body = null) {
    const res = await fetch(`${PG_BASE}${path}`, {
        method,
        headers: {
            'x-client-id': CF_CLIENT_ID,
            'x-client-secret': CF_CLIENT_SECRET,
            'x-api-version': CF_API_VERSION,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error(`Cashfree PG ${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
    }
    return json;
}

// ── Create Order ─────────────────────────────────────────────────────────────
export async function createOrder(req, res) {
    try {
        const { verificationId, name, email, phone, amount, currency = 'INR' } = req.body;

        if (!verificationId || !name || !email || !phone || !amount) {
            return res.status(400).json({ success: false, error: 'verificationId, name, email, phone, amount are required' });
        }
        if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
            return res.status(503).json({ success: false, error: 'Cashfree PG credentials not configured' });
        }

        const orderId = `PAY-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        const body = {
            order_id: orderId,
            order_amount: Number(amount),
            order_currency: currency,
            customer_details: {
                customer_id: `CUST-${Date.now()}`,
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
            },
            order_meta: {
                return_url: `${process.env.SERVER_URL}/payment/complete?order_id=${orderId}&verification_id=${verificationId}`,
                notify_url: `${process.env.SERVER_URL}/api/payment/webhook`,
            },
            order_note: `SEO AI Agent subscription — DigiLocker ID: ${verificationId}`,
        };

        console.log('[Payment] URL:', PG_BASE, '| ID:', process.env.CASHFREE_CLIENT_ID?.slice(0, 10), '| SECRET:', process.env.CASHFREE_CLIENT_SECRET?.slice(0, 14));
        console.log('[Payment] createOrder body:', JSON.stringify(body));
        const data = await pgJson('POST', '/orders', body);
        console.log('[Payment] createOrder response:', JSON.stringify(data));

        // Persist order
        const { error: dbErr } = await supabaseAdmin.from('payment_orders').insert({
            order_id: orderId,
            verification_id: verificationId,
            user_id: req.user?.id || null,
            amount: Number(amount),
            currency,
            status: 'CREATED',
            payment_session_id: data.payment_session_id,
        });
        if (dbErr) console.error('[Payment] DB insert error:', dbErr.message);

        return res.json({
            success: true,
            orderId,
            paymentSessionId: data.payment_session_id,
        });
    } catch (err) {
        console.error('[Payment] createOrder error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ── Get Order Status ──────────────────────────────────────────────────────────
export async function getOrderStatus(req, res) {
    try {
        const { orderId } = req.params;

        const data = await pgJson('GET', `/orders/${orderId}`);
        const status = (data.order_status || '').toUpperCase();

        await supabaseAdmin
            .from('payment_orders')
            .update({ status })
            .eq('order_id', orderId);

        return res.json({ success: true, orderId, status, raw: data });
    } catch (err) {
        console.error('[Payment] getOrderStatus error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ── Webhook ───────────────────────────────────────────────────────────────────
export async function handleWebhook(req, res) {
    try {
        const signature = req.headers['x-webhook-signature'];
        if (signature && CF_CLIENT_SECRET) {
            const timestamp = req.headers['x-webhook-timestamp'] || '';
            const rawBody   = req.rawBody?.toString('utf8') || '';
            const expected  = crypto
                .createHmac('sha256', CF_CLIENT_SECRET)
                .update(timestamp + rawBody)
                .digest('base64');
            if (signature !== expected) {
                console.warn('[Payment] Webhook signature mismatch');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

        const { data, type } = req.body;
        if (!data?.order?.order_id) {
            console.log('[Payment] Webhook ping received:', type);
            return res.sendStatus(200);
        }

        const orderId = data.order.order_id;
        const status  = (data.order.order_status || '').toUpperCase();

        await supabaseAdmin
            .from('payment_orders')
            .update({ status })
            .eq('order_id', orderId);

        console.log(`[Payment] Webhook: type=${type} order=${orderId} status=${status}`);
        return res.sendStatus(200);
    } catch (err) {
        console.error('[Payment] Webhook error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
