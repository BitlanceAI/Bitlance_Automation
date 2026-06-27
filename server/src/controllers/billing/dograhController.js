import crypto from 'crypto';
import axios from 'axios';
import { OpenAI } from 'openai';
import { supabaseAdmin } from '../../config/supabaseClient.js';
import CreditLedgerService from '../../services/credits/creditLedgerService.js';
import SocketService from '../../services/socket/socketService.js';

// Global object to track active call billing intervals in memory
global.activeCallBilling = global.activeCallBilling || {};

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Helper to find organization ID and Admin ID.
 */
async function getOrgAndAdmin(payload) {
    const metadata = payload.metadata || payload.custom_variables || {};
    const orgId = metadata.organization_id;

    if (orgId) {
        const { data: org } = await supabaseAdmin
            .from('organizations')
            .select('id, admin_id')
            .eq('id', orgId)
            .maybeSingle();
        if (org) return org;
    }

    // Fallback: Get first organization (since it's single-client)
    const { data: orgs } = await supabaseAdmin
        .from('organizations')
        .select('id, admin_id')
        .limit(1);

    if (orgs && orgs.length > 0) {
        return orgs[0];
    }

    throw new Error('No organization found for billing tracking.');
}

/**
 * Helper to terminate an active call via Dograh API (Vobiz integration)
 */
async function terminateDograhCall(callId) {
    const dograhApiUrl = (process.env.DOGRAH_API_URL || 'https://voice.bitlancetechhub.com').replace(/\/$/, '');
    const dograhApiKey = process.env.DOGRAH_API_KEY || process.env.RETELL_API_KEY;
    if (!dograhApiKey) {
        console.error('[TerminateCall] No API key configured for Dograh Call Termination');
        return false;
    }

    const endpoints = [
        `${dograhApiUrl}/api/v1/calls/end-call/${callId}`,
        `${dograhApiUrl}/api/v1/calls/end/${callId}`,
        `${dograhApiUrl}/api/v1/calls/terminate/${callId}`,
        `${dograhApiUrl}/v2/calls/end-call/${callId}`
    ];

    for (const url of endpoints) {
        try {
            console.log(`🔌 [TerminateCall] Attempting call termination at: ${url}`);
            const res = await axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${dograhApiKey}`,
                    'X-API-Key': dograhApiKey
                }
            });
            console.log(`🔌 [TerminateCall] Success:`, res.data);
            return true;
        } catch (err) {
            console.warn(`🔌 [TerminateCall] Endpoint failed ${url}:`, err.response?.data || err.message);
        }
    }
    return false;
}

/**
 * Helper to deduct credits from database wallet
 */
async function deductDbCredits(adminId, amount, callId, orgId) {
    if (amount <= 0) return 0;
    try {
        const { data, error } = await supabaseAdmin.rpc('deduct_credits_with_ledger', {
            p_user_id: adminId,
            p_agent_type: 'voice',
            p_reference_id: callId,
            p_reference_table: 'sales_calls',
            p_usage_quantity: Math.max(1, Math.round(amount)),
            p_metadata: { call_id: callId, is_partial: true }
        });
        if (error) {
            console.error(`[deductDbCredits] DB RPC Error:`, error.message);
            return 0;
        }
        return data.credits_deducted || 0;
    } catch (err) {
        console.error(`[deductDbCredits] Error:`, err.message);
        return 0;
    }
}

/**
 * Helper to refund credits back to database wallet
 */
async function refundDbCredits(adminId, amount, callId, orgId) {
    if (amount <= 0) return;
    try {
        const { data: wallet } = await supabaseAdmin
            .from('wallet')
            .select('id, balance')
            .eq('organization_id', orgId)
            .single();

        if (wallet) {
            const newBalance = parseFloat(wallet.balance) + amount;
            await supabaseAdmin
                .from('wallet')
                .update({ balance: newBalance, updated_at: new Date().toISOString() })
                .eq('id', wallet.id);

            await supabaseAdmin.from('transactions').insert({
                organization_id: orgId,
                wallet_id: wallet.id,
                amount: amount,
                type: 'credit',
                description: `Billing reconciliation adjustment refund for call ${callId}`,
                reference_table: 'sales_calls'
            });
            console.log(`✅ [Reconciliation] Refunded ${amount} credits to org ${orgId}`);
        }
    } catch (err) {
        console.error(`[refundDbCredits] Error:`, err.message);
    }
}

/**
 * Helper to perform AI analysis on call transcript
 */
async function analyzeCallTranscript(transcriptText) {
    if (!transcriptText) {
        return {
            summary: "No transcript available.",
            sentiment: "😐 Neutral",
            entities: {}
        };
    }

    try {
        console.log("🤖 [AI Analysis] Analyzing call transcript using OpenAI...");
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant that analyzes call transcripts for a hospital/business dashboard.
Extract the following information in JSON format:
{
  "summary": "A brief 2-3 sentence summary of the call",
  "sentiment": "😊 Positive, 😐 Neutral, or 😞 Negative (choose exactly one, including the emoji and text)",
  "entities": {
    "patient_name": "Name of the patient/customer (if mentioned, otherwise null)",
    "mobile": "Contact number (if mentioned, otherwise null)",
    "department": "Department requested like ENT, Pediatrics, General (if mentioned, otherwise null)",
    "appointment_date": "Date and time of appointment (if mentioned, otherwise null)",
    "email": "Email address (if mentioned, otherwise null)"
  }
}`
                },
                {
                    role: "user",
                    content: `Analyze the following transcript:\n\n${transcriptText}`
                }
            ],
            temperature: 0.1
        });

        const result = JSON.parse(response.choices[0].message.content);
        console.log("🤖 [AI Analysis] Completed successfully:", result);
        return result;
    } catch (err) {
        console.error("❌ [AI Analysis] Error analyzing transcript:", err.message);
        return {
            summary: "Failed to generate AI summary.",
            sentiment: "😐 Neutral",
            entities: {}
        };
    }
}

/**
 * Format transcripts if they arrive as structured array
 */
function formatTranscript(transcriptInput) {
    if (!transcriptInput) return "";
    if (typeof transcriptInput === 'string') return transcriptInput;
    if (Array.isArray(transcriptInput)) {
        return transcriptInput
            .map(msg => {
                const role = msg.role === 'agent' || msg.role === 'assistant' ? 'AI' : 'Customer';
                const text = msg.content || msg.text || '';
                return `${role}: ${text}`;
            })
            .join('\n');
    }
    return JSON.stringify(transcriptInput);
}

/**
 * Handle Webhooks from Dograh Voice Agent (Retell AI compatible)
 */
export const handleDograhWebhook = async (req, res) => {
    try {
        const event = req.body.event || req.body.event_type;
        const payload = req.body.call || req.body;

        console.log(`📞 [Dograh Webhook] Received event: ${event} for call_id: ${payload.call_id}`);

        if (!payload.call_id) {
            return res.status(400).json({ success: false, error: 'Missing call_id in webhook payload' });
        }

        // Get organization and admin info
        const orgInfo = await getOrgAndAdmin(payload);
        const orgId = orgInfo.id;
        const adminId = orgInfo.admin_id;

        if (event === 'call_started') {
            const callRecordId = crypto.randomUUID();

            // Fetch current wallet balance
            const { data: wallet } = await supabaseAdmin
                .from('wallet')
                .select('balance')
                .eq('organization_id', orgId)
                .single();
            const startBalance = wallet ? parseFloat(wallet.balance) : 0.00;

            // 1. Insert into active_calls
            const { data: activeCall, error } = await supabaseAdmin
                .from('active_calls')
                .insert({
                    call_id: payload.call_id,
                    organization_id: orgId,
                    customer_number: payload.from_number || payload.customer_number || 'Unknown',
                    agent_id: payload.agent_id || 'Unknown',
                    agent_name: payload.agent_name || 'AI Voice Agent',
                    started_at: new Date(payload.start_timestamp || Date.now()).toISOString()
                })
                .select()
                .single();

            if (error && error.code !== '23505') {
                console.error('[Dograh Webhook] Active call DB error:', error.message);
            }

            // 2. Setup in-memory billing interval
            if (global.activeCallBilling[payload.call_id]) {
                clearInterval(global.activeCallBilling[payload.call_id].intervalId);
            }

            const session = {
                callRecordId,
                startBalance,
                startedAt: Date.now(),
                orgId,
                adminId,
                creditsDeductedSoFar: 0,
                lastIntegerBalance: Math.floor(startBalance)
            };

            session.intervalId = setInterval(async () => {
                try {
                    const elapsedSeconds = Math.round((Date.now() - session.startedAt) / 1000);
                    const currentCreditsUsed = (elapsedSeconds / 60) * 5;
                    const currentFloatBalance = session.startBalance - currentCreditsUsed;

                    console.log(`⏱️ [CallBilling Tick] Call ${payload.call_id} | Duration: ${elapsedSeconds}s | Used: ${currentCreditsUsed.toFixed(4)} | Balance: ${currentFloatBalance.toFixed(4)}`);

                    if (currentFloatBalance <= 0) {
                        console.log(`🚨 [RealTimeBilling] Balance reached <= 0. Terminating call ${payload.call_id}!`);
                        clearInterval(session.intervalId);
                        delete global.activeCallBilling[payload.call_id];

                        const finalToDeduct = session.startBalance - session.creditsDeductedSoFar;
                        if (finalToDeduct > 0) {
                            await deductDbCredits(session.adminId, finalToDeduct, session.callRecordId, session.orgId);
                        }

                        SocketService.emitWalletUpdate(session.orgId, 0);
                        SocketService.emitLiveCall(session.orgId, {
                            event: 'call_progress',
                            call: {
                                call_id: payload.call_id,
                                duration: elapsedSeconds,
                                credits_used: session.startBalance,
                                balance: 0
                            }
                        });

                        await terminateDograhCall(payload.call_id);
                        return;
                    }

                    // Check crossed integer boundary
                    const currentIntegerBalance = Math.floor(currentFloatBalance);
                    if (currentIntegerBalance < session.lastIntegerBalance) {
                        const diff = session.lastIntegerBalance - currentIntegerBalance;
                        const deducted = await deductDbCredits(session.adminId, diff, session.callRecordId, session.orgId);
                        session.creditsDeductedSoFar += deducted;
                        session.lastIntegerBalance = currentIntegerBalance;
                    }

                    // Emit progress
                    SocketService.emitLiveCall(session.orgId, {
                        event: 'call_progress',
                        call: {
                            call_id: payload.call_id,
                            duration: elapsedSeconds,
                            credits_used: parseFloat(currentCreditsUsed.toFixed(4)),
                            balance: parseFloat(currentFloatBalance.toFixed(4))
                        }
                    });

                    SocketService.emitWalletUpdate(session.orgId, parseFloat(currentFloatBalance.toFixed(4)));

                } catch (timerErr) {
                    console.error('[RealTimeBilling Timer] Error:', timerErr.message);
                }
            }, 1000);

            global.activeCallBilling[payload.call_id] = session;

            // 3. Broadcast call_started to socket
            SocketService.emitLiveCall(orgId, {
                event: 'call_started',
                call: activeCall || {
                    call_id: payload.call_id,
                    customer_number: payload.from_number || payload.customer_number || 'Unknown',
                    agent_name: payload.agent_name || 'AI Voice Agent',
                    started_at: new Date().toISOString()
                }
            });

        } else if (event === 'call_ended' || event === 'call_finished' || event === 'call_analyzed') {
            const session = global.activeCallBilling[payload.call_id];
            if (session) {
                clearInterval(session.intervalId);
                delete global.activeCallBilling[payload.call_id];
            }

            // Calculate final duration
            let durationSeconds = payload.duration_seconds || 0;
            if (durationSeconds === 0 && payload.end_timestamp && payload.start_timestamp) {
                durationSeconds = Math.round((payload.end_timestamp - payload.start_timestamp) / 1000);
            }
            if (durationSeconds === 0 && session) {
                durationSeconds = Math.round((Date.now() - session.startedAt) / 1000);
            }
            durationSeconds = Math.max(0, durationSeconds);

            const finalCreditsNeeded = Math.ceil(durationSeconds / 60) * 5;
            const callRecordId = session ? session.callRecordId : crypto.randomUUID();

            // Reconcile database billing
            let finalDeducted = finalCreditsNeeded;
            if (session) {
                const adjustment = session.creditsDeductedSoFar - finalCreditsNeeded;
                if (adjustment > 0) {
                    // Refund over-deducted credits
                    await refundDbCredits(session.adminId, adjustment, callRecordId, session.orgId);
                } else if (adjustment < 0) {
                    // Deduct remaining under-deducted credits
                    const extraDeducted = await deductDbCredits(session.adminId, Math.abs(adjustment), callRecordId, session.orgId);
                    finalDeducted = session.creditsDeductedSoFar + extraDeducted;
                } else {
                    finalDeducted = session.creditsDeductedSoFar;
                }
            } else {
                // If no session started (e.g. webhook skipped call_started), perform complete deduction
                if (finalCreditsNeeded > 0 && adminId) {
                    finalDeducted = await deductDbCredits(adminId, finalCreditsNeeded, callRecordId, orgId);
                }
            }

            // Parse and format raw transcript text
            const transcriptRaw = formatTranscript(payload.transcript || payload.transcript_object);

            // Perform AI analysis on call transcript
            const aiAnalysis = await analyzeCallTranscript(transcriptRaw);

            // Bundle transcript details as a single structured JSON string inside the transcript column
            const transcriptJsonBundle = JSON.stringify({
                raw: transcriptRaw,
                summary: aiAnalysis.summary,
                sentiment: aiAnalysis.sentiment,
                entities: aiAnalysis.entities
            });

            // Fetch current final wallet balance for broadcasting
            const { data: finalWallet } = await supabaseAdmin
                .from('wallet')
                .select('balance')
                .eq('organization_id', orgId)
                .single();
            const finalBalance = finalWallet ? parseFloat(finalWallet.balance) : 0;

            // 4. Insert into sales_calls history
            const { data: callHistoryRow, error: historyErr } = await supabaseAdmin
                .from('sales_calls')
                .insert({
                    id: callRecordId,
                    call_id: payload.call_id,
                    organization_id: orgId,
                    customer_number: payload.from_number || payload.customer_number || 'Unknown',
                    agent_id: payload.agent_id || 'Unknown',
                    agent_name: payload.agent_name || 'AI Voice Agent',
                    duration: durationSeconds,
                    credits_used: finalDeducted,
                    status: payload.disconnection_reason || 'completed',
                    recording_url: payload.recording_url || null,
                    transcript: transcriptJsonBundle,
                    started_at: new Date(payload.start_timestamp || Date.now()).toISOString(),
                    ended_at: new Date(payload.end_timestamp || Date.now()).toISOString()
                })
                .select()
                .single();

            if (historyErr) {
                console.error('[Dograh Webhook] History insert failed:', historyErr.message);
            }

            // 5. Remove from active_calls
            const { error: deleteErr } = await supabaseAdmin
                .from('active_calls')
                .delete()
                .eq('call_id', payload.call_id);

            if (deleteErr) {
                console.error('[Dograh Webhook] Active call delete failed:', deleteErr.message);
            }

            // 6. Broadcast ended and wallet updates to sockets
            SocketService.emitLiveCall(orgId, {
                event: 'call_ended',
                call_id: payload.call_id,
                call: callHistoryRow
            });

            SocketService.emitWalletUpdate(orgId, finalBalance);
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('[Dograh Webhook] Error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};
