/**
 * Razorpay Payment Controller — Live Mode
 *
 * Used ONLY for non-admin users on the app to purchase credit plans.
 * Admin users are excluded from this flow.
 *
 * Credentials are pulled from environment:
 *   RAZORPAY_KEY_ID     = rzp_live_...
 *   RAZORPAY_KEY_SECRET = ...
 */

import crypto from 'crypto';
import { supabaseAdmin } from '../../config/supabaseClient.js';

const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_API        = 'https://api.razorpay.com/v1';

// ─── Comprehensive Bitlance Pricing Catalogue (2026) ────────────────────────
export const BITLANCE_PRICING = {
    marketBenchmarks: {
        seo: [
            { segment: 'Local Freelancer',        monthly: '₹3,000 – ₹8,000' },
            { segment: 'Professional Freelancer',  monthly: '₹5,000 – ₹25,000' },
            { segment: 'Small Agency',             monthly: '₹15,000 – ₹60,000' },
            { segment: 'Mid-Tier Agency',          monthly: '₹50,000 – ₹1,50,000' },
            { segment: 'Enterprise Agency',        monthly: '₹1,50,000 – ₹5,00,000+' },
        ],
        emailAutomation: [
            { segment: 'DIY Tools',            monthly: '₹500 – ₹3,000' },
            { segment: 'Basic Agency',         monthly: '₹5,000 – ₹15,000' },
            { segment: 'Advanced Automation',  monthly: '₹15,000 – ₹50,000+' },
            { segment: 'Enterprise',           monthly: '₹50,000 – ₹5,00,000+' },
        ],
        voiceAI: [
            { platform: 'Retell',             approxCost: '₹6 – ₹26/min' },
            { platform: 'Vapi',               approxCost: '₹4 – ₹15/min' },
            { platform: 'Bland',              approxCost: '₹7 – ₹8/min' },
            { platform: 'Enterprise Voice AI', approxCost: '₹20 – ₹80/min' },
        ],
        graphicDesign: [
            { provider: 'Canva Pro',               monthly: '₹500 – ₹1,000' },
            { provider: 'Freelancer',               monthly: '₹5,000 – ₹15,000' },
            { provider: 'Professional Designer',    monthly: '₹15,000 – ₹30,000' },
            { provider: 'Subscription Agency',      monthly: '₹25,000 – ₹1,00,000+' },
        ],
    },

    // ── SEO + GEO Plans ──────────────────────────────────────────────────────
    seoGeoPlan: {
        plans: [
            {
                name: 'Test Live',
                priceINR: 1,
                credits: 1,
                seoBlogs: 1,
                geoBlogs: 1,
                mixedCapacity: '1',
                popular: false,
            },
            {
                name: 'Starter',
                priceINR: 999,
                credits: 3000,
                seoBlogs: 60,
                geoBlogs: 40,
                mixedCapacity: '45–50',
                popular: false,
            },
            {
                name: 'Growth',
                priceINR: 4999,
                credits: 12000,
                seoBlogs: 240,
                geoBlogs: 160,
                mixedCapacity: '180–200',
                popular: true,
            },
            {
                name: 'Pro',
                priceINR: 9999,
                credits: 19999,
                seoBlogs: 399,
                geoBlogs: 266,
                mixedCapacity: '300+',
                popular: false,
            },
        ],
        features: [
            { feature: 'SEO Optimization',       starter: true,  growth: true,  pro: true  },
            { feature: 'GEO Optimization',        starter: true,  growth: true,  pro: true  },
            { feature: 'Internal Linking',        starter: true,  growth: true,  pro: true  },
            { feature: 'AI Search Optimization',  starter: true,  growth: true,  pro: true  },
            { feature: 'Brand Knowledge',         starter: false, growth: true,  pro: true  },
            { feature: 'AI Overview Optimization',starter: false, growth: true,  pro: true  },
            { feature: 'Multi-Agent Research',    starter: false, growth: false, pro: true  },
            { feature: 'Competitor Analysis',     starter: false, growth: false, pro: true  },
            { feature: 'Content Audits',          starter: false, growth: false, pro: true  },
            { feature: 'Priority Generation',     starter: false, growth: false, pro: true  },
        ],
        creditConsumption: [
            { action: 'Keyword Research',          credits: 10 },
            { action: 'SEO Blog',                  credits: 50 },
            { action: 'GEO Blog',                  credits: 75 },
            { action: 'Premium SEO + GEO Blog',    credits: 100 },
            { action: 'Content Audit',             credits: 15 },
            { action: 'Rewrite',                   credits: 20 },
            { action: 'AI Search Optimization',    credits: 15 },
            { action: 'Internal Linking',          credits: 10 },
        ],
    },

    // ── Voice AI Add-On ──────────────────────────────────────────────────────
    voiceAIAddon: [
        { minutes: 500,   approxCostINR: '₹2,500 – ₹5,000',   useCase: 'Lead Qualification' },
        { minutes: 2000,  approxCostINR: '₹8,000 – ₹15,000',  useCase: 'Appointment Booking' },
        { minutes: 5000,  approxCostINR: '₹20,000 – ₹35,000', useCase: 'Sales Outreach' },
        { minutes: 10000, approxCostINR: '₹40,000 – ₹70,000', useCase: 'Enterprise' },
    ],

    // ── Email Automation Plans ───────────────────────────────────────────────
    emailAutomationPlans: [
        { name: 'Starter', priceINR: 999,   credits: 500,   capacity: '250 Emails',  popular: false },
        { name: 'Growth',  priceINR: 2999,  credits: 2000,  capacity: '1,000 Emails', popular: true  },
        { name: 'Pro',     priceINR: 7999,  credits: 5000,  capacity: '2,500 Emails', popular: false },
        { name: 'Agency',  priceINR: 19999, credits: 15000, capacity: 'Custom',       popular: false },
    ],
};

// ─── Helper: Razorpay API call ────────────────────────────────────────────────
async function rzpFetch(method, path, body = null) {
    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const res = await fetch(`${RAZORPAY_API}${path}`, {
        method,
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error(`Razorpay ${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
    }
    return json;
}

// ─── GET /api/razorpay/pricing ────────────────────────────────────────────────
// Public endpoint – returns full pricing catalogue
export async function getPricing(req, res) {
    return res.json({ success: true, pricing: BITLANCE_PRICING });
}

// ─── POST /api/razorpay/create-order ─────────────────────────────────────────
// Creates a Razorpay live-mode order for a credit plan purchase.
// Only allowed for regular (non-admin) users.
export async function createOrder(req, res) {
    try {
        const { planType, planName } = req.body; // planType: 'seo_geo' | 'email', planName: 'Starter'|'Growth'|'Pro'|'Agency'

        if (!planType || !planName) {
            return res.status(400).json({ success: false, error: 'planType and planName are required' });
        }
        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ success: false, error: 'Razorpay credentials not configured on server' });
        }

        // Block admin users from purchasing through this flow
        const userRole = req.user?.user_metadata?.role || req.user?.raw_user_meta_data?.role;
        if (userRole === 'admin') {
            return res.status(403).json({ success: false, error: 'Admin accounts are not eligible for self-serve plan purchases.' });
        }

        // Look up the plan price
        let selectedPlan = null;
        if (planType === 'seo_geo') {
            selectedPlan = BITLANCE_PRICING.seoGeoPlan.plans.find(p => p.name === planName);
        } else if (planType === 'email') {
            selectedPlan = BITLANCE_PRICING.emailAutomationPlans.find(p => p.name === planName);
        }

        if (!selectedPlan) {
            return res.status(404).json({ success: false, error: `Plan "${planName}" not found for type "${planType}"` });
        }

        // Razorpay amounts are in paise (INR × 100)
        const amountPaise = selectedPlan.priceINR * 100;
        const receiptId = `BL-${planType.toUpperCase()}-${planName.toUpperCase()}-${Date.now()}`;

        const rzpOrder = await rzpFetch('POST', '/orders', {
            amount: amountPaise,
            currency: 'INR',
            receipt: receiptId,
            notes: {
                userId: req.user.id,
                planType,
                planName,
                credits: selectedPlan.credits,
            },
        });

        // Persist order in DB
        const { error: dbErr } = await supabaseAdmin.from('payment_orders').insert({
            order_id: rzpOrder.id,
            user_id: req.user.id,
            amount: selectedPlan.priceINR,
            currency: 'INR',
            status: 'CREATED',
            payment_session_id: rzpOrder.id,
            // Store plan metadata for credit fulfillment in webhook
        });
        if (dbErr) console.error('[Razorpay] DB insert error:', dbErr.message);

        return res.json({
            success: true,
            orderId: rzpOrder.id,
            amount: amountPaise,
            currency: 'INR',
            keyId: RAZORPAY_KEY_ID,
            plan: {
                name: planName,
                type: planType,
                credits: selectedPlan.credits,
                priceINR: selectedPlan.priceINR,
            },
        });
    } catch (err) {
        console.error('[Razorpay] createOrder error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ─── POST /api/razorpay/verify ────────────────────────────────────────────────
// Verifies the payment signature and credits the user on success.
export async function verifyPayment(req, res) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType, planName } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, error: 'razorpay_order_id, razorpay_payment_id, razorpay_signature are required' });
        }

        // 1. Verify HMAC signature
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.warn('[Razorpay] Signature mismatch for order:', razorpay_order_id);
            return res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
        }

        // 2. Look up plan credits
        let creditsToAdd = 0;
        if (planType === 'seo_geo') {
            const plan = BITLANCE_PRICING.seoGeoPlan.plans.find(p => p.name === planName);
            if (plan) creditsToAdd = plan.credits;
        } else if (planType === 'email') {
            const plan = BITLANCE_PRICING.emailAutomationPlans.find(p => p.name === planName);
            if (plan) creditsToAdd = plan.credits;
        }

        if (creditsToAdd === 0) {
            return res.status(400).json({ success: false, error: 'Could not determine credits for plan.' });
        }

        const userId = req.user.id;

        // 3. Credit the user (upsert into user_credits)
        const { data: currentRow } = await supabaseAdmin
            .from('user_credits')
            .select('balance, total_credits')
            .eq('user_id', userId)
            .single();

        const currentBalance = currentRow?.balance || 0;
        const currentTotal = currentRow?.total_credits || 0;
        const newBalance = currentBalance + creditsToAdd;
        const newTotal = currentTotal + creditsToAdd;

        const { error: creditErr } = await supabaseAdmin
            .from('user_credits')
            .upsert({ 
                user_id: userId, 
                balance: newBalance, 
                total_credits: newTotal,
                email_50_sent: false,
                email_75_sent: false,
                email_90_sent: false,
                email_100_sent: false,
                updated_at: new Date().toISOString() 
            }, { onConflict: 'user_id' });

        if (creditErr) throw creditErr;

        // 4. Update order status in DB
        await supabaseAdmin
            .from('payment_orders')
            .update({ status: 'PAID' })
            .eq('order_id', razorpay_order_id);

        console.log(`[Razorpay] ✅ Payment verified. User ${userId} credited +${creditsToAdd}. New balance: ${newBalance}`);

        return res.json({
            success: true,
            message: `Payment verified! ${creditsToAdd.toLocaleString()} credits added to your account.`,
            creditsAdded: creditsToAdd,
            newBalance,
        });
    } catch (err) {
        console.error('[Razorpay] verifyPayment error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ─── POST /api/razorpay/webhook ───────────────────────────────────────────────
// Razorpay webhook for async payment events (backup to verify flow)
export async function handleWebhook(req, res) {
    try {
        const signature = req.headers['x-razorpay-signature'];
        if (signature && RAZORPAY_KEY_SECRET) {
            const rawBody = req.rawBody?.toString('utf8') || JSON.stringify(req.body);
            const expectedSig = crypto
                .createHmac('sha256', RAZORPAY_KEY_SECRET)
                .update(rawBody)
                .digest('hex');
            if (signature !== expectedSig) {
                console.warn('[Razorpay Webhook] Signature mismatch');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

        const { event, payload } = req.body;
        console.log('[Razorpay Webhook] Event:', event);

        if (event === 'payment.captured') {
            const orderId = payload?.payment?.entity?.order_id;
            if (orderId) {
                await supabaseAdmin.from('payment_orders').update({ status: 'PAID' }).eq('order_id', orderId);
                console.log('[Razorpay Webhook] Order marked PAID:', orderId);
            }
        }

        return res.sendStatus(200);
    } catch (err) {
        console.error('[Razorpay Webhook] Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
