import crypto from 'crypto';
import axios from 'axios';
import { OpenAI } from 'openai';
import { oldSupabaseAdmin, newSupabaseAdmin, supabaseStore } from '../../config/supabaseClient.js';

// newDb = voice dashboard client activity (calls, transcripts, analytics, leads)
// oldDb = billing only (credit deductions, ledger)
const newDb = newSupabaseAdmin;
const oldDb = oldSupabaseAdmin;
import CreditLedgerService from '../../services/credits/creditLedgerService.js';
import SocketService from '../../services/socket/socketService.js';

// Global object to track active call billing intervals in memory
global.activeCallBilling = global.activeCallBilling || {};

const DOGRAH_POLL_WORKFLOW_PLACEHOLDER = 1;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export function getDograhConfig() {
    let apiUrl = (process.env.DOGRAH_API_URL || 'https://api.dograh.com').trim().replace(/\/$/, '');
    if (!/^https?:\/\//i.test(apiUrl)) {
        apiUrl = `https://${apiUrl}`;
    }
    return {
        apiUrl,
        apiKey: process.env.DOGRAH_API_KEY || process.env.RETELL_API_KEY
    };
}

/**
 * Resolve the billing session key from Dograh/Retell webhook or polling payloads.
 * Billing keys sessions by workflow_run_id, while telephony uses a separate call UUID.
 */
export function resolveBillingCallId(payload = {}) {
    const candidates = [
        payload.workflow_run_id,
        payload.run_id,
        payload.call_id,
        payload.id
    ];

    for (const candidate of candidates) {
        if (candidate != null && candidate !== '') {
            return String(candidate);
        }
    }

    return null;
}

export function findActiveCallSession(payload = {}) {
    const keys = new Set();

    const billingCallId = resolveBillingCallId(payload);
    if (billingCallId) keys.add(billingCallId);
    if (payload.gathered_context?.call_id) keys.add(String(payload.gathered_context.call_id));
    if (payload.initial_context?.mps_correlation_id) keys.add(String(payload.initial_context.mps_correlation_id));

    for (const key of keys) {
        if (global.activeCallBilling[key]) {
            return { sessionKey: key, session: global.activeCallBilling[key] };
        }
    }

    return { sessionKey: billingCallId, session: null };
}

export function clearActiveCallSession(sessionKey) {
    const session = global.activeCallBilling[sessionKey];
    if (session?.intervalId) {
        clearInterval(session.intervalId);
    }
    delete global.activeCallBilling[sessionKey];
}

/**
 * Dograh accepts any integer workflow_id in the poll path and returns the real run record.
 */
export async function fetchDograhRun(runId, workflowId = null) {
    const { apiUrl, apiKey } = getDograhConfig();
    if (!apiKey) {
        throw new Error('Dograh API key not configured');
    }

    const pollWorkflowId = workflowId || process.env.DOGRAH_WORKFLOW_ID || DOGRAH_POLL_WORKFLOW_PLACEHOLDER;
    const pollUrl = `${apiUrl}/api/v1/workflow/${pollWorkflowId}/runs/${runId}`;
    const runRes = await axios.get(pollUrl, {
        headers: { 'X-API-Key': apiKey }
    });

    return runRes.data;
}

export function isDograhRunCompleted(runData) {
    if (!runData) return false;
    if (runData.is_completed === true) return true;

    const status = String(runData.status || '').toLowerCase();
    return ['completed', 'failed', 'busy', 'no-answer', 'no_answer', 'cancelled'].includes(status);
}

export function extractRunDurationSeconds(runData, fallbackStartedAt = null) {
    let durationSeconds = runData?.usage_info?.call_duration_seconds
        ?? runData?.cost_info?.call_duration_seconds
        ?? runData?.duration_seconds
        ?? 0;

    if (durationSeconds === 0 && runData?.end_timestamp && runData?.start_timestamp) {
        durationSeconds = Math.round((runData.end_timestamp - runData.start_timestamp) / 1000);
    }

    const callbacks = runData?.logs?.telephony_status_callbacks;
    if (durationSeconds === 0 && Array.isArray(callbacks) && callbacks.length > 0) {
        const firstTs = callbacks[0]?.timestamp || callbacks[0]?.StartTime || callbacks[0]?.SessionStart;
        const lastCallback = callbacks[callbacks.length - 1];
        const lastTs = lastCallback?.timestamp || lastCallback?.EndTime;
        if (firstTs && lastTs) {
            durationSeconds = Math.max(0, Math.round((new Date(lastTs) - new Date(firstTs)) / 1000));
        }
    }

    if (durationSeconds === 0 && fallbackStartedAt) {
        durationSeconds = Math.round((Date.now() - fallbackStartedAt) / 1000);
    }

    return Math.max(0, durationSeconds);
}

export function extractRunStatus(runData) {
    return runData?.gathered_context?.mapped_call_disposition
        || runData?.gathered_context?.call_disposition
        || runData?.disconnection_reason
        || 'completed';
}

export function extractRecordingUrl(runData) {
    let url = runData?.recording_public_url
        || runData?.recording_url
        || runData?.user_recording_public_url
        || runData?.user_recording_url
        || null;

    if (url && typeof url === 'string') {
        url = url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            const { apiUrl } = getDograhConfig();
            const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
            const path = url.startsWith('/') ? url : `/${url}`;
            return `${base}${path}`;
        }
    }
    return url;
}

async function fetchTranscriptContent(runData) {
    const inlineTranscript = runData?.transcript || runData?.transcript_object;
    if (inlineTranscript) {
        return formatTranscript(inlineTranscript);
    }

    let transcriptUrl = runData?.transcript_public_url || runData?.transcript_url;
    if (!transcriptUrl) return '';

    if (typeof transcriptUrl === 'string') {
        transcriptUrl = transcriptUrl.trim();
        if (!transcriptUrl.startsWith('http://') && !transcriptUrl.startsWith('https://')) {
            const { apiUrl } = getDograhConfig();
            const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
            const path = transcriptUrl.startsWith('/') ? transcriptUrl : `/${transcriptUrl}`;
            transcriptUrl = `${base}${path}`;
        }
    }

    try {
        const { apiKey } = getDograhConfig();
        const res = await axios.get(transcriptUrl, {
            headers: apiKey ? { 'X-API-Key': apiKey } : undefined
        });
        return formatTranscript(res.data);
    } catch (err) {
        console.warn('[Dograh] Failed to fetch transcript URL:', transcriptUrl, err.message);
        return '';
    }
}

/**
 * Shared cleanup: reconcile credits, persist history, remove active call, emit socket events.
 */
export async function finalizeActiveCall({
    sessionKey,
    session,
    callId,
    runData = {},
    phoneNumber,
    agentId,
    agentName = 'Voice Agent',
    orgId,
    adminId,
    forcedCreditsUsed = null
}) {
    if (session?.finalizing) {
        return null;
    }
    if (session) {
        session.finalizing = true;
    }

    // If recording/transcript URLs are missing from webhook payload, poll Dograh API for up to 12 seconds
    let finalRunData = runData;
    const isCompleted = isDograhRunCompleted(runData);
    if (isCompleted) {
        let attempts = 0;
        const maxAttempts = 6; // Poll every 2 seconds for up to 12 seconds
        while (attempts < maxAttempts && (!finalRunData?.recording_url || !finalRunData?.transcript_url)) {
            console.log(`[Dograh Poll] Recording/Transcript missing. Polling run ${callId} (attempt ${attempts + 1}/${maxAttempts})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                const polledData = await fetchDograhRun(callId);
                if (polledData) {
                    finalRunData = polledData;
                }
            } catch (err) {
                console.warn(`[Dograh Poll] Failed to poll run ${callId}:`, err.message);
            }
            attempts++;
        }
    }

    if (session) {
        clearActiveCallSession(sessionKey);
    }

    const { data: existingCall } = await newDb
        .from('sales_calls')
        .select('*')
        .eq('call_id', callId)
        .maybeSingle();

    const durationSeconds = extractRunDurationSeconds(finalRunData, session?.startedAt || (existingCall ? new Date(existingCall.started_at).getTime() : null));
    const finalCreditsNeeded = forcedCreditsUsed != null
        ? forcedCreditsUsed
        : (durationSeconds / 60) * 5;
    const callRecordId = session?.callRecordId || existingCall?.id || crypto.randomUUID();

    let finalDeducted = finalCreditsNeeded;
    if (existingCall) {
        finalDeducted = existingCall.credits_used;
    } else if (session) {
        const adjustment = session.creditsDeductedSoFar - finalCreditsNeeded;
        if (adjustment > 0) {
            await refundDbCredits(session.adminId, adjustment, callRecordId, session.orgId);
            finalDeducted = finalCreditsNeeded;
        } else if (adjustment < 0) {
            const extraDeducted = await deductDbCredits(session.adminId, Math.abs(adjustment), callRecordId, session.orgId);
            finalDeducted = session.creditsDeductedSoFar + extraDeducted;
        } else {
            finalDeducted = session.creditsDeductedSoFar;
        }
    } else if (finalCreditsNeeded > 0 && adminId) {
        finalDeducted = await deductDbCredits(adminId, finalCreditsNeeded, callRecordId, orgId);
    }

    const transcriptRaw = await fetchTranscriptContent(finalRunData);
    const aiAnalysis = await analyzeCallTranscript(transcriptRaw);
    const transcriptJsonBundle = JSON.stringify({
        raw: transcriptRaw,
        summary: aiAnalysis.summary,
        sentiment: aiAnalysis.sentiment,
        overall_sentiment: aiAnalysis.overall_sentiment,
        sentiment_score: aiAnalysis.sentiment_score,
        confidence: aiAnalysis.confidence,
        customer_emotion: aiAnalysis.customer_emotion,
        interest_level: aiAnalysis.interest_level,
        buying_intent: aiAnalysis.buying_intent,
        call_outcome: aiAnalysis.call_outcome,
        customer_satisfaction: aiAnalysis.customer_satisfaction,
        objections: aiAnalysis.objections,
        complaints: aiAnalysis.complaints,
        key_topics: aiAnalysis.key_topics,
        positive_signals: aiAnalysis.positive_signals,
        negative_signals: aiAnalysis.negative_signals,
        customer_name: aiAnalysis.customer_name
    });

    const targetCustomerPhone = phoneNumber || finalRunData?.initial_context?.phone_number || finalRunData?.customer_phone || 'Unknown';

    if (newSupabaseAdmin) {
        try {
            console.log('🤖 [newSupabaseAdmin] Saving call analytics to new Supabase for customer:', targetCustomerPhone);
            const { error: newSbError } = await newSupabaseAdmin
                .from('call_analytics')
                .insert({
                    call_id: callId,
                    overall_sentiment: aiAnalysis.overall_sentiment || 'neutral',
                    sentiment_score: aiAnalysis.sentiment_score || 50,
                    confidence: aiAnalysis.confidence || 80,
                    customer_emotion: aiAnalysis.customer_emotion || 'Neutral',
                    customer_name: aiAnalysis.customer_name || null,
                    customer_phone: targetCustomerPhone,
                    interest_level: aiAnalysis.interest_level || 'medium',
                    buying_intent: aiAnalysis.buying_intent || 'medium',
                    call_outcome: aiAnalysis.call_outcome || 'Completed',
                    customer_satisfaction: aiAnalysis.customer_satisfaction || 'medium',
                    objections: aiAnalysis.objections || [],
                    complaints: aiAnalysis.complaints || [],
                    key_topics: aiAnalysis.key_topics || [],
                    positive_signals: aiAnalysis.positive_signals || [],
                    negative_signals: aiAnalysis.negative_signals || [],
                    summary: aiAnalysis.summary || '',
                    created_at: new Date(finalRunData?.created_at || finalRunData?.start_timestamp || session?.startedAt || Date.now()).toISOString()
                });
            if (newSbError) {
                console.error('❌ [newSupabaseAdmin] Failed to write call_analytics:', newSbError.message);
            } else {
                console.log('✅ [newSupabaseAdmin] Successfully saved call_analytics');
            }
        } catch (err) {
            console.error('❌ [newSupabaseAdmin] Exception writing call_analytics:', err.message);
        }
    } else {
        console.warn('⚠️ [newSupabaseAdmin] not configured, skipping call_analytics save');
    }

    const { data: finalWallet } = await newDb
        .from('wallet')
        .select('balance')
        .eq('organization_id', orgId)
        .single();
    const finalBalance = finalWallet ? parseFloat(finalWallet.balance) : 0;

    let callHistoryRow = null;
    let historyErr = null;

    if (existingCall) {
        const { data: updatedRow, error: updateErr } = await newDb
            .from('sales_calls')
            .update({
                duration: durationSeconds,
                credits_used: finalDeducted,
                status: extractRunStatus(finalRunData),
                recording_url: extractRecordingUrl(finalRunData) || existingCall.recording_url,
                transcript: transcriptJsonBundle,
                ended_at: new Date(finalRunData?.end_timestamp || Date.now()).toISOString()
            })
            .eq('id', existingCall.id)
            .select()
            .single();
        callHistoryRow = updatedRow;
        historyErr = updateErr;
    } else {
        const { data: insertedRow, error: insertErr } = await newDb
            .from('sales_calls')
            .insert({
                id: callRecordId,
                call_id: callId,
                organization_id: orgId,
                customer_number: phoneNumber || finalRunData?.initial_context?.phone_number || 'Unknown',
                agent_id: agentId || finalRunData?.initial_context?.workflow_uuid || finalRunData?.initial_context?.agent_identifier || 'Unknown',
                agent_name: agentName,
                duration: durationSeconds,
                credits_used: finalDeducted,
                status: extractRunStatus(finalRunData),
                recording_url: extractRecordingUrl(finalRunData),
                transcript: transcriptJsonBundle,
                started_at: new Date(finalRunData?.created_at || finalRunData?.start_timestamp || session?.startedAt || Date.now()).toISOString(),
                ended_at: new Date(finalRunData?.end_timestamp || Date.now()).toISOString()
            })
            .select()
            .single();
        callHistoryRow = insertedRow;
        historyErr = insertErr;
    }

    if (historyErr) {
        console.error('[Call Finalize] History insert failed:', historyErr.message);
    }

    const { error: deleteErr } = await newDb
        .from('active_calls')
        .delete()
        .eq('call_id', callId);

    if (deleteErr) {
        console.error('[Call Finalize] Active call delete failed:', deleteErr.message);
    }

    SocketService.emitLiveCall(orgId, {
        event: 'call_ended',
        call_id: callId,
        call: callHistoryRow || {
            call_id: callId,
            duration: durationSeconds,
            credits_used: finalDeducted,
            balance: finalBalance,
            status: extractRunStatus(finalRunData),
            recording_url: extractRecordingUrl(finalRunData),
            transcript: transcriptJsonBundle
        }
    });

    SocketService.emitWalletUpdate(orgId, finalBalance);

    return {
        callHistoryRow,
        durationSeconds,
        finalDeducted,
        finalBalance
    };
}

/**
 * On server startup, finalize any active calls that already ended in Dograh
 * but were left behind due to polling failures or server restarts.
 */
export async function recoverStaleActiveCalls() {
    // 1. Recover from the old/default database
    await supabaseStore.run({ origin: 'https://www.bitlancetechhub.com', referer: '' }, async () => {
        await recoverFromDb('Default DB');
    });

    // 2. Recover from the new database (if configured)
    if (process.env.NEW_SUPABASE_URL) {
        await supabaseStore.run({ origin: 'https://lotlite.bitlancetechhub.com', referer: '' }, async () => {
            await recoverFromDb('New DB (Lotlite)');
        });
    }
}

async function recoverFromDb(dbName) {
    try {
        const { data: activeCalls, error } = await newDb
            .from('active_calls')
            .select('*');

        if (error) throw error;
        if (!activeCalls?.length) return;

        console.log(`🔄 [Recovery - ${dbName}] Checking ${activeCalls.length} stale active call(s)...`);

        for (const activeCall of activeCalls) {
            try {
                const runData = await fetchDograhRun(activeCall.call_id);
                if (!isDograhRunCompleted(runData)) {
                    console.log(`🔄 [Recovery - ${dbName}] Call ${activeCall.call_id} still active in Dograh, skipping.`);
                    continue;
                }

                const { data: org } = await newDb
                    .from('organizations')
                    .select('admin_id')
                    .eq('id', activeCall.organization_id)
                    .maybeSingle();

                console.log(`🔄 [Recovery - ${dbName}] Finalizing stale call ${activeCall.call_id}`);
                await finalizeActiveCall({
                    sessionKey: activeCall.call_id,
                    session: global.activeCallBilling[activeCall.call_id] || null,
                    callId: activeCall.call_id,
                    runData,
                    phoneNumber: activeCall.customer_number,
                    agentId: activeCall.agent_id,
                    agentName: activeCall.agent_name || 'Voice Agent',
                    orgId: activeCall.organization_id,
                    adminId: org?.admin_id || null
                });
            } catch (callErr) {
                console.warn(`[Recovery - ${dbName}] Could not recover call ${activeCall.call_id}:`, callErr.message);
            }
        }
    } catch (err) {
        console.error(`[Recovery - ${dbName}] Stale active call recovery failed:`, err.message);
    }
}

/**
 * Helper to find organization ID and Admin ID.
 */
export async function getOrgAndAdmin(payload) {
    const metadata = payload.metadata || payload.custom_variables || {};
    const orgId = metadata.organization_id;

    if (orgId) {
        const { data: org } = await newDb
            .from('organizations')
            .select('id, admin_id')
            .eq('id', orgId)
            .maybeSingle();
        if (org) return org;
    }

    // Fallback: Get first organization (since it's single-client)
    const { data: orgs } = await newDb
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
export async function terminateDograhCall(callId, telephonyCallId = null) {
    const { apiUrl: dograhApiUrl, apiKey: dograhApiKey } = getDograhConfig();
    if (!dograhApiKey) {
        console.error('[TerminateCall] No API key configured for Dograh Call Termination');
        return false;
    }

    const idsToTry = [telephonyCallId, callId].filter(Boolean);
    const endpoints = [];

    for (const id of idsToTry) {
        endpoints.push(
            `${dograhApiUrl}/api/v1/calls/end-call/${id}`,
            `${dograhApiUrl}/api/v1/calls/end/${id}`,
            `${dograhApiUrl}/api/v1/calls/terminate/${id}`,
            `${dograhApiUrl}/v2/calls/end-call/${id}`
        );
    }

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
export async function deductDbCredits(adminId, amount, callId, orgId) {
    if (amount <= 0) return 0;
    try {
        // Credit deductions go to OLD DB (Bitlance billing)
        const { data, error } = await oldDb.rpc('deduct_credits_with_ledger', {
            p_user_id: adminId,
            p_agent_type: 'voice',
            p_reference_id: callId,
            p_reference_table: 'sales_calls',
            p_usage_quantity: Number(amount.toFixed(4)),
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
export async function refundDbCredits(adminId, amount, callId, orgId) {
    if (amount <= 0) return;
    try {
        const { data: wallet } = await newDb
            .from('wallet')
            .select('id, balance')
            .eq('organization_id', orgId)
            .single();

        if (wallet) {
            const newBalance = parseFloat(wallet.balance) + amount;
            await newDb
                .from('wallet')
                .update({ balance: newBalance, updated_at: new Date().toISOString() })
                .eq('id', wallet.id);

            await newDb.from('transactions').insert({
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
export async function analyzeCallTranscript(transcriptText) {
    if (!transcriptText) {
        return {
            summary: "No transcript available.",
            overall_sentiment: "neutral",
            sentiment: "😐 Neutral",
            sentiment_score: 50,
            confidence: 50,
            customer_emotion: "Neutral",
            interest_level: "medium",
            buying_intent: "medium",
            call_outcome: "Unknown",
            customer_satisfaction: "medium",
            objections: [],
            complaints: [],
            key_topics: [],
            positive_signals: [],
            negative_signals: [],
            customer_name: null
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
                    content: `You are an AI assistant that analyzes call transcripts for a business dashboard.
Analyze the conversation between the AI assistant and the customer.
Extract all requested information in the following JSON format:
{
  "summary": "A brief 2-3 sentence summary of the call, stating what the client/customer wanted or did",
  "overall_sentiment": "positive" or "neutral" or "negative",
  "sentiment_score": a number from 0 to 100 representing the client's mood (0 is extremely negative, 50 is neutral, 100 is extremely positive),
  "confidence": a number from 0 to 100 representing your confidence in this analysis,
  "customer_emotion": "a single word describing customer's emotional state, e.g. Happy, Curious, Interested, Impatient, Frustrated, Angry, Neutral",
  "interest_level": "low" or "medium" or "high",
  "buying_intent": "low" or "medium" or "high",
  "call_outcome": "Brief summary of how the call ended or the outcome (e.g. Appointment scheduled, Callback requested, Disconnected, Not interested)",
  "customer_satisfaction": "low" or "medium" or "high",
  "objections": [
    { "text": "brief description of objection raised by customer", "handled": true/false }
  ],
  "complaints": [
    { "text": "brief description of complaint raised by customer", "resolved": true/false }
  ],
  "key_topics": ["topic 1", "topic 2", ...],
  "positive_signals": ["positive feedback or signal 1", "signal 2", ...],
  "negative_signals": ["negative feedback or signal 1", "signal 2", ...],
  "customer_name": "Name of the customer if mentioned, otherwise null"
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
        
        // Populate standard compatibility sentiment string
        const emoji = result.overall_sentiment === 'positive' ? '😊' : result.overall_sentiment === 'negative' ? '😞' : '😐';
        result.sentiment = `${emoji} ${result.overall_sentiment.charAt(0).toUpperCase() + result.overall_sentiment.slice(1)}`;
        
        console.log("🤖 [AI Analysis] Completed successfully:", result);
        return result;
    } catch (err) {
        console.error("❌ [AI Analysis] Error analyzing transcript:", err.message);
        return {
            summary: "Failed to generate AI summary.",
            overall_sentiment: "neutral",
            sentiment: "😐 Neutral",
            sentiment_score: 50,
            confidence: 50,
            customer_emotion: "Neutral",
            interest_level: "medium",
            buying_intent: "medium",
            call_outcome: "Error",
            customer_satisfaction: "medium",
            objections: [],
            complaints: [],
            key_topics: [],
            positive_signals: [],
            negative_signals: [],
            customer_name: null
        };
    }
}

/**
 * Format transcripts if they arrive as structured array
 */
export function formatTranscript(transcriptInput) {
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
        const body = req.body || {};
        const event = body.event || body.event_type || body.status;
        const payload = body.call || body;

        const callId = resolveBillingCallId(payload);
        console.log(`📞 [Dograh Webhook] Received event: ${event} for billing call_id: ${callId}`);

        if (!callId) {
            return res.status(400).json({ success: false, error: 'Missing call identifier in webhook payload' });
        }

        const orgInfo = await getOrgAndAdmin(payload);
        const orgId = orgInfo.id;
        const adminId = orgInfo.admin_id;

        const endEvents = ['call_ended', 'call_finished', 'call_analyzed', 'completed', 'failed', 'busy', 'no-answer'];
        const normalizedEvent = String(event || '').toLowerCase();
        const shouldFinalize = endEvents.includes(normalizedEvent)
            || payload.is_completed === true
            || isDograhRunCompleted(payload);

        if (shouldFinalize) {
            const { sessionKey, session } = findActiveCallSession(payload);

            await finalizeActiveCall({
                sessionKey: sessionKey || callId,
                session,
                callId,
                runData: payload,
                phoneNumber: payload.from_number || payload.customer_number || payload.initial_context?.phone_number,
                agentId: payload.agent_id || payload.initial_context?.workflow_uuid || payload.initial_context?.agent_identifier,
                agentName: payload.agent_name || 'Voice Agent',
                orgId: session?.orgId || orgId,
                adminId: session?.adminId || adminId
            });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('[Dograh Webhook] Error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};
