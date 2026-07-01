import { newSupabaseAdmin } from '../src/config/supabaseClient.js';

const outcomes = [
    'interested',
    'not_interested',
    'dnd',
    'do_not_call',
    'wrong_number',
    'lead_qualified',
    'lead_unqualified',
    'followup',
    'booking',
    'positive',
    'negative',
    'neutral',
    'successful',
    'unsuccessful',
    'callback',
    'answering_machine',
    'voicemail',
    ''
];

async function testOutcomes() {
    for (const outcome of outcomes) {
        const { error } = await newSupabaseAdmin
            .from('call_analytics')
            .insert({
                call_id: 'test_temp2_' + outcome,
                overall_sentiment: 'neutral',
                customer_phone: '+918318768905',
                call_outcome: outcome
            });
        
        if (error) {
            console.log(`❌ Outcome '${outcome}' FAILED:`, error.message);
        } else {
            console.log(`✅ Outcome '${outcome}' SUCCEEDED!`);
            // Clean up
            await newSupabaseAdmin.from('call_analytics').delete().eq('call_id', 'test_temp2_' + outcome);
        }
    }
}

testOutcomes();
