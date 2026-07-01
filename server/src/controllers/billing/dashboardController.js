import { oldSupabaseAdmin, newSupabaseAdmin } from '../../config/supabaseClient.js';

// newDb = voice dashboard client activity (organizations, wallet, sales_calls, active_calls)
// oldDb = billing only (user_credits, credit_ledger, payment_orders)
const newDb = newSupabaseAdmin;
const oldDb = oldSupabaseAdmin;
// supabaseAdmin alias points to newDb for all client activity in this controller
const supabaseAdmin = newDb;
import axios from 'axios';
import crypto from 'crypto';
import SocketService from '../../services/socket/socketService.js';
import { sendPurchaseSuccessEmail } from '../../services/email/welcomeEmailService.js';
import { deductDbCredits, terminateDograhCall, fetchDograhRun, isDograhRunCompleted, extractRecordingUrl, finalizeActiveCall } from './dograhController.js';

// Global object to track active call billing intervals in memory
global.activeCallBilling = global.activeCallBilling || {};

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
        // Seed wallet with 10 starting credits for the client organization
        const initialBalance = 10;

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
        let activeQuery = supabaseAdmin
            .from('active_calls')
            .select('*', { count: 'exact', head: true });
        
        if (req.user.email !== 'demo@bitlancetechhub.com') {
            activeQuery = activeQuery.eq('organization_id', orgId);
        }

        const { count: activeCallsCount, error: activeErr } = await activeQuery;

        if (activeErr) throw activeErr;

        // Fetch today's calls count, duration, and credits used
        let todayQuery = supabaseAdmin
            .from('sales_calls')
            .select('duration, credits_used')
            .gte('created_at', startOfDay.toISOString());

        if (req.user.email !== 'demo@bitlancetechhub.com') {
            todayQuery = todayQuery.eq('organization_id', orgId);
        }

        const { data: todayCalls, error: todayErr } = await todayQuery;

        if (todayErr) throw todayErr;

        // Fetch total calls history count
        let totalQuery = supabaseAdmin
            .from('sales_calls')
            .select('*', { count: 'exact', head: true });

        if (req.user.email !== 'demo@bitlancetechhub.com') {
            totalQuery = totalQuery.eq('organization_id', orgId);
        }

        const { count: totalCallsCount, error: totalErr } = await totalQuery;

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

        let query = supabaseAdmin
            .from('active_calls')
            .select('*')
            .order('started_at', { ascending: false });

        if (req.user.email !== 'demo@bitlancetechhub.com') {
            query = query.eq('organization_id', org.id);
        }

        const { data: activeCalls, error } = await query;

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

        let query = supabaseAdmin
            .from('sales_calls')
            .select('*', { count: 'exact' });

        if (req.user.email !== 'demo@bitlancetechhub.com') {
            query = query.eq('organization_id', org.id);
        }

        const { data: calls, error, count } = await query
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
 * Get voice leads filtered by user's organization calls or phone numbers
 */
export const getVoiceLeads = async (req, res) => {
    try {
        const userId = req.user.id;
        const { org } = await ensureOrgAndWallet(userId);

        // 1. Fetch user's own call history to know which numbers/calls they own
        let callQuery = supabaseAdmin
            .from('sales_calls')
            .select('call_id, customer_number');

        if (req.user.email !== 'demo@bitlancetechhub.com') {
            callQuery = callQuery.eq('organization_id', org.id);
        }

        const { data: calls, error: callsErr } = await callQuery;
        if (callsErr) throw callsErr;

        const normalize = (p) => p.replace(/^\+/, '').replace(/\s/g, '');
        const myPhonesSet = new Set(calls.map(c => normalize(c.customer_number || '')).filter(Boolean));
        const myCallIdsSet = new Set(calls.map(c => String(c.call_id || '')).filter(Boolean));

        // 2. Fetch voice leads from new Supabase
        const { data: voiceLeads, error: leadsErr } = await supabaseAdmin
            .from('lotlite_leads')
            .select('id, call_id, call_time, duration_seconds, preferred_language, purpose, first_name, full_name, mobile_number, email, property_type, city, locality, budget, size_bhk, amenities, move_in_timeline, recording_url, transcript_url, phone_number')
            .order('call_time', { ascending: false });

        if (leadsErr) throw leadsErr;

        // Check if the user has Admin rights
        const isAdmin = req.user.email === 'bitlanceai@gmail.com';

        // 3. Filter voice leads
        const filteredLeads = (voiceLeads || []).filter((item) => {
            if (isAdmin) return true;
            if (item.call_id && myCallIdsSet.has(String(item.call_id))) return true;
            const num = item.mobile_number || item.phone_number;
            if (num && myPhonesSet.has(normalize(num))) return true;
            return false;
        });

        res.json({
            success: true,
            leads: filteredLeads
        });
    } catch (err) {
        console.error('[VoiceLeads] Error:', err.message);
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

        let query = oldDb
            .from('payments')
            .select('*', { count: 'exact' });

        if (req.user.email !== 'demo@bitlancetechhub.com') {
            query = query.eq('organization_id', org.id);
        }

        const { data: payments, error, count } = await query
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
        let dograhApiUrl = (process.env.DOGRAH_API_URL || 'https://voice.bitlancetechhub.com').trim().replace(/\/$/, '');
        if (!/^https?:\/\//i.test(dograhApiUrl)) {
            dograhApiUrl = `https://${dograhApiUrl}`;
        }
        const dograhApiKey = process.env.DOGRAH_API_KEY || process.env.RETELL_API_KEY;
        const callerId = fromNumber || process.env.DOGRAH_FROM_NUMBER || process.env.RETELL_FROM_NUMBER;

        if (!dograhApiKey) {
            console.error('[TriggerCall] Missing DOGRAH_API_KEY in server environment variables');
            return res.status(500).json({ success: false, error: 'Dograh voice service API key not configured on the server.' });
        }

        console.log(`📞 [TriggerCall] Initiating Dograh Vobiz outbound call to ${phoneNumber} using agent/trigger path UUID: ${agentId}`);

        let serverUrl = (process.env.SERVER_URL || process.env.SERVER || '').trim().replace(/\/$/, '');
        if (!serverUrl) {
            serverUrl = 'https://backend.bitlancetechhub.com';
        } else if (!/^https?:\/\//i.test(serverUrl)) {
            serverUrl = `https://${serverUrl}`;
        }

        // 4. Send POST request to Dograh API Trigger endpoint using Agent UUID
        const triggerUrl = `${dograhApiUrl}/api/v1/public/agent/workflow/${agentId}`;
        const response = await axios.post(
            triggerUrl,
            {
                phone_number: phoneNumber,
                initial_context: {
                    organization_id: org.id,
                    webhook_url: `${serverUrl}/webhooks/dograh`,
                    server_url: `${serverUrl}/webhooks/dograh`
                }
            },
            {
                headers: {
                    'X-API-Key': dograhApiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        const callId = response.data.workflow_run_id
            ? response.data.workflow_run_id.toString()
            : (response.data.id ? response.data.id.toString() : crypto.randomUUID());
        const workflowId = response.data.workflow_id || process.env.DOGRAH_WORKFLOW_ID || null;
        const telephonyCallId = response.data.call_id ? String(response.data.call_id) : null;
        const callRecordId = crypto.randomUUID();

        console.log(`📞 [TriggerCall] Dograh run started | run_id=${callId} | workflow_id=${workflowId || 'resolved-on-poll'} | response=${JSON.stringify(response.data)}`);

        // 5. Fetch current wallet balance
        const { data: currentWallet } = await supabaseAdmin
            .from('wallet')
            .select('balance')
            .eq('organization_id', org.id)
            .single();
        const startBalance = currentWallet ? parseFloat(currentWallet.balance) : 0.00;

        // 6. Insert into active_calls
        const { data: activeCall, error } = await supabaseAdmin
            .from('active_calls')
            .insert({
                call_id: callId,
                organization_id: org.id,
                customer_number: phoneNumber,
                agent_id: agentId,
                agent_name: 'Voice Agent',
                started_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error && error.code !== '23505') {
            console.error('[TriggerCall] Active call DB error:', error.message);
        }

        // 7. Setup in-memory billing interval immediately
        if (global.activeCallBilling[callId]) {
            clearInterval(global.activeCallBilling[callId].intervalId);
        }

        const session = {
            callRecordId,
            startBalance,
            startedAt: Date.now(),
            orgId: org.id,
            adminId: org.admin_id || req.user.id,
            creditsDeductedSoFar: 0,
            lastIntegerBalance: Math.floor(startBalance),
            tickCount: 0,
            workflowId,
            phoneNumber,
            agentId,
            telephonyCallId,
            lastTranscriptSnippet: '',
            lastRecordingUrl: null
        };

        session.intervalId = setInterval(async () => {
            try {
                const elapsedSeconds = Math.round((Date.now() - session.startedAt) / 1000);
                const currentCreditsUsed = (elapsedSeconds / 60) * 5;
                const currentFloatBalance = session.startBalance - currentCreditsUsed;

                console.log(`⏱️ [LiveBilling Tick] Call ${callId} | Duration: ${elapsedSeconds}s | Used: ${currentCreditsUsed.toFixed(4)} | Balance: ${currentFloatBalance.toFixed(4)}`);

                // Allow credits to go negative without terminating the call

                // Check crossed integer boundary
                const currentIntegerBalance = Math.floor(currentFloatBalance);
                if (currentIntegerBalance < session.lastIntegerBalance) {
                    const diff = session.lastIntegerBalance - currentIntegerBalance;
                    const deducted = await deductDbCredits(session.adminId, diff, session.callRecordId, session.orgId);
                    session.creditsDeductedSoFar += deducted;
                    session.lastIntegerBalance = currentIntegerBalance;
                }

                // Emit progress with live credits, transcript, and recording when available
                const progressPayload = {
                    call_id: callId,
                    duration: elapsedSeconds,
                    credits_used: parseFloat(currentCreditsUsed.toFixed(4)),
                    balance: parseFloat(currentFloatBalance.toFixed(4))
                };
                if (session.lastTranscriptSnippet) {
                    progressPayload.transcript_preview = session.lastTranscriptSnippet;
                }
                if (session.lastRecordingUrl) {
                    progressPayload.recording_url = session.lastRecordingUrl;
                }

                SocketService.emitLiveCall(session.orgId, {
                    event: 'call_progress',
                    call: progressPayload
                });

                SocketService.emitWalletUpdate(session.orgId, parseFloat(currentFloatBalance.toFixed(4)));

                // Poll Dograh run status every 5 ticks (5 seconds)
                session.tickCount += 1;
                if (session.tickCount % 5 === 0) {
                    try {
                        const runData = await fetchDograhRun(callId, session.workflowId);
                        if (runData.workflow_id && !session.workflowId) {
                            session.workflowId = runData.workflow_id;
                        }
                        if (runData.gathered_context?.call_id && !session.telephonyCallId) {
                            session.telephonyCallId = String(runData.gathered_context.call_id);
                        }

                        const recordingUrl = extractRecordingUrl(runData);
                        if (recordingUrl && recordingUrl !== session.lastRecordingUrl) {
                            session.lastRecordingUrl = recordingUrl;
                        }

                        const transcriptPreview = runData.transcript || runData.transcript_object;
                        if (transcriptPreview) {
                            const snippet = typeof transcriptPreview === 'string'
                                ? transcriptPreview.slice(0, 500)
                                : JSON.stringify(transcriptPreview).slice(0, 500);
                            session.lastTranscriptSnippet = snippet;
                        }

                        if (isDograhRunCompleted(runData)) {
                            console.log(`✅ [Polling] Call ${callId} ended. Finalizing billing session.`);
                            await finalizeActiveCall({
                                sessionKey: callId,
                                session,
                                callId,
                                runData,
                                phoneNumber: session.phoneNumber,
                                agentId: session.agentId,
                                orgId: session.orgId,
                                adminId: session.adminId
                            });
                            return;
                        }
                    } catch (pollErr) {
                        console.error(`❌ [Polling] Error checking run status for call ${callId}:`, pollErr.response?.data || pollErr.message);
                    }
                }

            } catch (timerErr) {
                console.error('[LiveBilling Timer] Error:', timerErr.message);
            }
        }, 1000);

        global.activeCallBilling[callId] = session;

        // 8. Broadcast call_started to socket
        SocketService.emitLiveCall(org.id, {
            event: 'call_started',
            call: activeCall || {
                call_id: callId,
                customer_number: phoneNumber,
                agent_name: 'Voice Agent',
                started_at: new Date().toISOString()
            }
        });

        res.json({
            success: true,
            message: 'Dograh voice call successfully triggered',
            call: response.data
        });

    } catch (err) {
        console.error('[TriggerCall] Error initiating call:', err.response?.data || err.message);
        
        const status = err.response?.status;
        if (status === 401 || status === 402) {
            return res.status(status).json({ 
                success: false, 
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Internal server error' 
            });
        }

        let errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to trigger call';
        if (typeof errMsg === 'string') {
            errMsg = errMsg
                .replace(/dograh/gi, 'telephony provider')
                .replace(/retell/gi, 'telephony provider')
                .replace(/vobiz/gi, 'telephony provider');
        }

        res.status(status || 500).json({ 
            success: false, 
            error: errMsg 
        });
    }
};

/**
 * Force terminate an active call from the dashboard (Manual stop)
 */
export const forceTerminateCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const session = global.activeCallBilling[callId];
        
        if (!session) {
            // Might be an orphaned active call in DB but no memory session
            const { data: activeCall } = await supabaseAdmin.from('active_calls').select('*').eq('call_id', callId).maybeSingle();
            if (!activeCall) return res.status(404).json({ success: false, error: 'Active call not found' });
            
            await supabaseAdmin.from('active_calls').delete().eq('call_id', callId);
            return res.json({ success: true, message: 'Cleaned up orphaned call' });
        }

        console.log(`🚨 [Force Terminate] User requested force termination for call ${callId}`);
        clearInterval(session.intervalId);

        // Terminate on Dograh's side
        await terminateDograhCall(callId, session.telephonyCallId);

        // Fetch final data if possible
        let runData = {};
        try {
            runData = await fetchDograhRun(callId, session.workflowId);
        } catch (err) {}

        const result = await finalizeActiveCall({
            sessionKey: callId,
            session,
            callId,
            runData,
            phoneNumber: session.phoneNumber,
            agentId: session.agentId,
            orgId: session.orgId,
            adminId: session.adminId,
            forcedCreditsUsed: null // Will calculate based on exact seconds used so far
        });

        res.json({ success: true, message: 'Call forcefully terminated.', result });
    } catch (err) {
        console.error('[ForceTerminate] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Create a Razorpay Order for custom wallet recharge
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body; // In INR

        if (!amount || isNaN(amount) || amount < 1) {
            return res.status(400).json({ success: false, error: 'Valid amount (minimum ₹1) is required.' });
        }

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            console.error('[Razorpay] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in server environment variables');
            return res.status(503).json({ success: false, error: 'Razorpay payment service not configured on the server.' });
        }

        // Get organization
        const { org } = await ensureOrgAndWallet(userId);

        const amountWithGst = amount * 1.18;
        const amountPaise = Math.round(amountWithGst * 100);
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
        const { error: dbErr } = await oldDb.from('payments').insert({
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
        const { data: payment, error: fetchErr } = await oldDb
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
        const { error: payErr } = await oldDb
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

        // 4. Send payment confirmation email (fire-and-forget)
        try {
            const userEmail = req.user?.email || '';
            const userName = req.user?.name || req.user?.full_name || userEmail.split('@')[0];
            if (userEmail) {
                sendPurchaseSuccessEmail(
                    userEmail,
                    userName,
                    payment.amount,
                    `₹${payment.amount} Wallet Recharge`,
                    'voice_billing',
                    creditsToAdd,
                    newBalance
                ).catch(err => console.error('[Razorpay Verify] Failed to send payment email:', err.message));
            }
        } catch (emailErr) {
            console.error('[Razorpay Verify] Payment email error:', emailErr.message);
        }

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

/**
 * Mark Razorpay payment as FAILED
 */
export const failRazorpayPayment = async (req, res) => {
    try {
        const { order_id } = req.body;
        if (!order_id) {
            return res.status(400).json({ success: false, error: 'Missing order_id.' });
        }

        // Fetch payment details
        const { data: payment, error: fetchErr } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('order_id', order_id)
            .maybeSingle();

        if (fetchErr) throw fetchErr;
        if (!payment) {
            return res.status(404).json({ success: false, error: 'Payment order record not found.' });
        }

        if (payment.status === 'SUCCESS') {
            return res.json({ success: true, message: 'Payment was already processed successfully.' });
        }

        // Update payment record to FAILED
        const { error: payErr } = await supabaseAdmin
            .from('payments')
            .update({
                status: 'FAILED',
                updated_at: new Date().toISOString()
            })
            .eq('order_id', order_id);

        if (payErr) throw payErr;

        console.log(`[Razorpay Fail] Order ${order_id} marked as FAILED`);
        res.json({ success: true, message: 'Payment marked as failed.' });

    } catch (err) {
        console.error('[Razorpay Fail] Error marking payment as failed:', err.message);
        res.status(500).json({ success: false, error: err.message || 'Failed to update payment status.' });
    }
};

/**
 * Fetch Dograh workflows/agents associated with the user
 */
export const getUserWorkflows = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user?.email || '';

        // Try fetching from user_workflows table
        const { data: dbWorkflows, error: fetchErr } = await supabaseAdmin
            .from('user_workflows')
            .select('*')
            .eq('user_id', userId);

        if (fetchErr) {
            // If table doesn't exist, fall back to default workflows based on email
            if (fetchErr.message && (fetchErr.message.includes('relation') || fetchErr.message.includes('does not exist') || fetchErr.message.includes('schema cache'))) {
                console.log(`[getUserWorkflows] Table public.user_workflows not found. Using email-based workflows fallback for ${userEmail}.`);
                
                if (userEmail === 'itm.lotlite@gmail.com') {
                    return res.json({
                        success: true,
                        is_fallback: true,
                        workflows: [
                            {
                                workflow_id: '45b42390-369b-49b5-9a26-21a099dc843e',
                                workflow_name: 'Property Buyer Lead Call'
                            },
                            {
                                workflow_id: '0ae47ce1-5ada-411c-85ff-e28105a374e6',
                                workflow_name: 'Lotlite follow up and real estate'
                            }
                        ]
                    });
                }

                return res.json({
                    success: true,
                    is_fallback: true,
                    workflows: []
                });
            }
            throw fetchErr;
        }

        // If the table exists but is empty, also fallback to email-based ones
        if (!dbWorkflows || dbWorkflows.length === 0) {
            if (userEmail === 'itm.lotlite@gmail.com') {
                return res.json({
                    success: true,
                    workflows: [
                        {
                            workflow_id: '45b42390-369b-49b5-9a26-21a099dc843e',
                            workflow_name: 'Property Buyer Lead Call'
                        },
                        {
                            workflow_id: '0ae47ce1-5ada-411c-85ff-e28105a374e6',
                            workflow_name: 'Lotlite'
                        }
                    ]
                });
            }

            return res.json({
                success: true,
                workflows: []
            });
        }

        res.json({
            success: true,
            workflows: dbWorkflows
        });

    } catch (err) {
        console.error('[getUserWorkflows] Error fetching workflows:', err.message);
        res.status(500).json({ success: false, error: err.message || 'Failed to fetch workflows.' });
    }
};
