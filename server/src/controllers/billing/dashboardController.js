import { supabaseAdmin } from '../../config/supabaseClient.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Helper to ensure organization and wallet exist for the client admin user.
 * Auto-seeds if missing.
 */
async function ensureOrgAndWallet(userId) {
    // 1. Check if org exists
    let { data: org, error: orgErr } = await supabaseAdmin
        .from('organizations')
        .select('*')
        .eq('admin_id', userId)
        .maybeSingle();

    if (orgErr) throw orgErr;

    if (!org) {
        // Seed default org
        const { data: newOrg, error: insertOrgErr } = await supabaseAdmin
            .from('organizations')
            .insert({
                name: 'Default Client Company',
                admin_id: userId
            })
            .select()
            .single();

        if (insertOrgErr) throw insertOrgErr;
        org = newOrg;
    }

    // 2. Check if wallet exists
    let { data: wallet, error: walletErr } = await supabaseAdmin
        .from('wallet')
        .select('*')
        .eq('organization_id', org.id)
        .maybeSingle();

    if (walletErr) throw walletErr;

    if (!wallet) {
        // Seed wallet with 50 starting credits for the client organization
        const initialBalance = 50;

        const { data: newWallet, error: insertWalletErr } = await supabaseAdmin
            .from('wallet')
            .insert({
                organization_id: org.id,
                balance: initialBalance
            })
            .select()
            .single();

        if (insertWalletErr) throw insertWalletErr;
        wallet = newWallet;
    }

    return { org, wallet };
}

/**
 * Get aggregated dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { org, wallet } = await ensureOrgAndWallet(userId);

        const orgId = org.id;

        // Get today's dates
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Fetch active calls count
        const { count: activeCallsCount, error: activeErr } = await supabaseAdmin
            .from('active_calls')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId);

        if (activeErr) throw activeErr;

        // Fetch today's calls count, duration, and credits used
        const { data: todayCalls, error: todayErr } = await supabaseAdmin
            .from('sales_calls')
            .select('duration, credits_used')
            .eq('organization_id', orgId)
            .gte('created_at', startOfDay.toISOString());

        if (todayErr) throw todayErr;

        // Fetch total calls history count
        const { count: totalCallsCount, error: totalErr } = await supabaseAdmin
            .from('sales_calls')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId);

        if (totalErr) throw totalErr;

        // Calculate stats
        const todayCount = todayCalls.length;
        const todayDurationSeconds = todayCalls.reduce((sum, c) => sum + (c.duration || 0), 0);
        const todayMinutes = parseFloat((todayDurationSeconds / 60).toFixed(2));
        const todayCreditsUsed = todayCalls.reduce((sum, c) => sum + parseFloat(c.credits_used || 0), 0);

        res.json({
            success: true,
            organization: org,
            stats: {
                creditsRemaining: wallet.balance,
                todayCalls: todayCount,
                minutesUsedToday: todayMinutes,
                totalCalls: totalCallsCount || 0,
                activeCalls: activeCallsCount || 0,
                todayCreditsUsed: parseFloat(todayCreditsUsed.toFixed(2))
            }
        });
    } catch (err) {
        console.error('[DashboardStats] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get active calls list
 */
export const getActiveCalls = async (req, res) => {
    try {
        const userId = req.user.id;
        const { org } = await ensureOrgAndWallet(userId);

        const { data: activeCalls, error } = await supabaseAdmin
            .from('active_calls')
            .select('*')
            .eq('organization_id', org.id)
            .order('started_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, activeCalls });
    } catch (err) {
        console.error('[ActiveCalls] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get paginated call history
 */
export const getCallHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { org } = await ensureOrgAndWallet(userId);
        
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const { data: calls, error, count } = await supabaseAdmin
            .from('sales_calls')
            .select('*', { count: 'exact' })
            .eq('organization_id', org.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({
            success: true,
            calls,
            total: count || 0,
            limit,
            offset
        });
    } catch (err) {
        console.error('[CallHistory] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { org } = await ensureOrgAndWallet(userId);

        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const { data: payments, error, count } = await supabaseAdmin
            .from('payments')
            .select('*', { count: 'exact' })
            .eq('organization_id', org.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({
            success: true,
            payments,
            total: count || 0,
            limit,
            offset
        });
    } catch (err) {
        console.error('[PaymentHistory] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Trigger outbound call using a specific voice agent UUID
 */
export const triggerCall = async (req, res) => {
    try {
        const userId = req.user.id;
        const { phoneNumber, agentId, fromNumber } = req.body;

        if (!phoneNumber || !agentId) {
            return res.status(400).json({ success: false, error: 'phoneNumber and agentId are required.' });
        }

        // 1. Get organization and wallet
        const { org, wallet } = await ensureOrgAndWallet(userId);

        // 2. Prevent call trigger if wallet is empty/negative
        if (wallet.balance <= 0) {
            return res.status(402).json({ 
                success: false, 
                error: 'INSUFFICIENT_CREDITS', 
                message: 'Insufficient credits remaining. Please recharge your wallet.' 
            });
        }

        // 3. Prepare Dograh API configuration
        const dograhApiUrl = (process.env.DOGRAH_API_URL || 'https://voice.bitlancetechhub.com').replace(/\/$/, '');
        const dograhApiKey = process.env.DOGRAH_API_KEY || process.env.RETELL_API_KEY;
        const callerId = fromNumber || process.env.DOGRAH_FROM_NUMBER || process.env.RETELL_FROM_NUMBER;

        if (!dograhApiKey) {
            console.error('[TriggerCall] Missing DOGRAH_API_KEY in server environment variables');
            return res.status(500).json({ success: false, error: 'Dograh voice service API key not configured on the server.' });
        }

        console.log(`📞 [TriggerCall] Initiating Dograh Vobiz outbound call to ${phoneNumber} using agent/trigger path UUID: ${agentId}`);

        // 4. Send POST request to Dograh workflow trigger endpoint
        const triggerUrl = `${dograhApiUrl}/api/v1/workflows/trigger/${agentId}`;
        const response = await axios.post(
            triggerUrl,
            {
                phone_number: phoneNumber,
                to_number: phoneNumber,
                to_phone_number: phoneNumber,
                customer_number: phoneNumber,
                from_number: callerId || undefined,
                initial_context: {
                    organization_id: org.id
                },
                metadata: {
                    organization_id: org.id
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${dograhApiKey}`,
                    'X-API-Key': dograhApiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            message: 'Dograh voice call successfully triggered',
            call: response.data
        });

    } catch (err) {
        console.error('[TriggerCall] Error initiating call:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ 
            success: false, 
            error: err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to trigger call' 
        });
    }
};

/**
 * Create a Razorpay Order for custom wallet recharge
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body; // In INR

        if (!amount || isNaN(amount) || amount < 100) {
            return res.status(400).json({ success: false, error: 'Valid amount (minimum ₹100) is required.' });
        }

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.error('[Razorpay] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in server environment variables');
            return res.status(503).json({ success: false, error: 'Razorpay payment service not configured on the server.' });
        }

        // Get organization
        const { org } = await ensureOrgAndWallet(userId);

        const amountPaise = Math.round(amount * 100);
        const receiptId = `BILL-RECH-${org.id.substring(0,8)}-${Date.now()}`;

        // Create Razorpay Order
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const response = await axios.post(
            'https://api.razorpay.com/v1/orders',
            {
                amount: amountPaise,
                currency: 'INR',
                receipt: receiptId,
                notes: {
                    organization_id: org.id,
                    userId
                }
            },
            {
                headers: {
                    Authorization: `Basic ${authHeader}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const rzpOrder = response.data;

        // Save payment order to Supabase
        const { error: dbErr } = await supabaseAdmin.from('payments').insert({
            organization_id: org.id,
            order_id: rzpOrder.id,
            amount: amount,
            status: 'PENDING'
        });

        if (dbErr) {
            console.error('[Razorpay] Error saving payment details:', dbErr.message);
            throw dbErr;
        }

        res.json({
            success: true,
            orderId: rzpOrder.id,
            amount: amountPaise,
            currency: 'INR',
            keyId: keyId
        });

    } catch (err) {
        console.error('[Razorpay Order] Error creating order:', err.response?.data || err.message);
        res.status(500).json({ success: false, error: err.message || 'Failed to create payment order.' });
    }
};

/**
 * Verify Razorpay payment and credit the wallet
 */
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Missing payment verification details.' });
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.warn('[Razorpay Verify] Signature mismatch for order:', razorpay_order_id);
            return res.status(400).json({ success: false, error: 'Payment signature verification failed.' });
        }

        // Get organization and wallet
        const { org, wallet } = await ensureOrgAndWallet(userId);

        // Fetch payment details
        const { data: payment, error: fetchErr } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('order_id', razorpay_order_id)
            .maybeSingle();

        if (fetchErr) throw fetchErr;
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment order record not found.' });
        }

        if (payment.status === 'SUCCESS') {
            return res.json({ success: true, message: 'Payment already processed successfully.' });
        }

        // Calculate credits to add (1 credit per INR)
        const creditsToAdd = Math.round(payment.amount * 1);

        const newBalance = wallet.balance + creditsToAdd;

        // 1. Update wallet balance
        const { error: walletErr } = await supabaseAdmin
            .from('wallet')
            .update({ 
                balance: newBalance,
                updated_at: new Date().toISOString()
            })
            .eq('id', wallet.id);

        if (walletErr) throw walletErr;

        // 2. Update payment record
        const { error: payErr } = await supabaseAdmin
            .from('payments')
            .update({
                payment_id: razorpay_payment_id,
                status: 'SUCCESS',
                updated_at: new Date().toISOString()
            })
            .eq('order_id', razorpay_order_id);

        if (payErr) throw payErr;

        // 3. Insert transaction log
        const { error: txnErr } = await supabaseAdmin
            .from('transactions')
            .insert({
                organization_id: org.id,
                wallet_id: wallet.id,
                amount: creditsToAdd,
                type: 'credit',
                description: `Razorpay Recharge (Order ID: ${razorpay_order_id})`,
                reference_id: payment.id,
                reference_table: 'payments'
            });

        if (txnErr) console.error('[Razorpay Verify] Error writing transaction log:', txnErr.message);

        console.log(`[Razorpay Verify] ✅ Payment Successful. Organization ${org.name} wallet credited +${creditsToAdd}`);

        res.json({
            success: true,
            message: `Payment successful! ₹${payment.amount} converted to ${creditsToAdd} credits.`,
            newBalance
        });

    } catch (err) {
        console.error('[Razorpay Verify] Error verifying payment:', err.message);
        res.status(500).json({ success: false, error: err.message || 'Verification failed.' });
    }
};
