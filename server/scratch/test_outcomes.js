import { newSupabaseAdmin } from '../src/config/supabaseClient.js';

const outcomes = [
    'appointment_scheduled',
    'callback_requested',
    'disconnected',
    'not_interested',
    'interested',
    'answered',
    'no_answer',
    'busy',
    'failed',
    'completed',
    'user_qualified',
    'user_unqualified',
    'success',
    'pending',
    'unknown',
    'Error'
];

async function testOutcomes() {
    for (const outcome of outcomes) {
        const { error } = await newSupabaseAdmin
            .from('call_analytics')
            .insert({
                call_id: 'test_temp_' + outcome,
                overall_sentiment: 'neutral',
                customer_phone: '+918318768905',
                call_outcome: outcome
            });
        
        if (error) {
            console.log(`❌ Outcome '${outcome}' FAILED:`, error.message);
        } else {
            console.log(`✅ Outcome '${outcome}' SUCCEEDED!`);
            // Clean up
            await newSupabaseAdmin.from('call_analytics').delete().eq('call_id', 'test_temp_' + outcome);
        }
    }
}

testOutcomes();
