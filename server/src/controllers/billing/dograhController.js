import { supabaseAdmin } from '../../config/supabaseClient.js';
import CreditLedgerService from '../../services/credits/creditLedgerService.js';
import SocketService from '../../services/socket/socketService.js';

/**
 * Helper to find organization ID and Admin ID.
 * If organization_id is in metadata, we use it.
 * Otherwise, fallback to the first organization.
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

            if (error && error.code !== '23505') { // Ignore unique constraint violation if re-sent
                console.error('[Dograh Webhook] Active call DB error:', error.message);
            }

            // 2. Broadcast live update via Socket
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
            // 1. Calculate duration (default to 0 if not provided)
            let durationSeconds = payload.duration_seconds || 0;
            if (durationSeconds === 0 && payload.end_timestamp && payload.start_timestamp) {
                durationSeconds = Math.round((payload.end_timestamp - payload.start_timestamp) / 1000);
            }

            // Ensure duration is non-negative
            durationSeconds = Math.max(0, durationSeconds);

            // 2. Fetch call details to insert record
            const callRecordId = crypto.randomUUID ? crypto.randomUUID() : payload.call_id;

            // 3. Deduct credits: 5 credits consumed per minute (rounded up to the nearest minute)
            const creditsToConsume = Math.ceil(durationSeconds / 60) * 5;
            let creditsDeducted = 0;
            let newBalance = 0;

            if (creditsToConsume > 0 && adminId) {
                try {
                    const deductionResult = await CreditLedgerService.deductCreditsWithLedger({
                        userId: adminId,
                        agentType: 'voice',
                        referenceId: callRecordId,
                        referenceTable: 'sales_calls',
                        usageQuantity: creditsToConsume,
                        metadata: {
                            call_id: payload.call_id,
                            agent_id: payload.agent_id,
                            duration_seconds: durationSeconds
                        }
                    });
                    
                    creditsDeducted = deductionResult.credits_deducted;
                    newBalance = deductionResult.new_balance;
                } catch (deductionErr) {
                    console.error('[Dograh Webhook] Credit deduction failed:', deductionErr.message);
                }
            }

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
                    credits_used: creditsDeducted,
                    status: payload.disconnection_reason || 'completed',
                    recording_url: payload.recording_url || null,
                    transcript: payload.transcript || null,
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

            // 6. Broadcast live updates via Socket
            SocketService.emitLiveCall(orgId, {
                event: 'call_ended',
                call_id: payload.call_id,
                call: callHistoryRow
            });

            // Broadcast new wallet balance
            if (newBalance !== undefined) {
                SocketService.emitWalletUpdate(orgId, newBalance);
            }
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('[Dograh Webhook] Error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};
