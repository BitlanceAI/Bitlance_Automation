import { newSupabaseAdmin } from '../src/config/supabaseClient.js';

async function testInsert() {
    console.log('Inserting mock call_analytics...');
    const targetCustomerPhone = '+918318768905';
    const { data, error } = await newSupabaseAdmin
        .from('call_analytics')
        .insert({
            call_id: '556967',
            overall_sentiment: 'neutral',
            sentiment_score: 50,
            confidence: 90,
            customer_emotion: ['Neutral'],
            customer_name: null,
            customer_phone: targetCustomerPhone,
            interest_level: 'low',
            buying_intent: 'low',
            call_outcome: 'Completed',
            customer_satisfaction: 'medium',
            objections: [],
            complaints: [],
            key_topics: ['Real Estate', 'Customer Assistance'],
            positive_signals: ['Polite interaction', 'Willingness to assist in the future'],
            negative_signals: ['Customer declined to provide name', 'No immediate interest expressed'],
            summary: 'The customer declined to provide their name and did not express any immediate interest in real estate services. The assistant offered future assistance if needed.',
            created_at: new Date('2026-06-30T12:33:34.391Z').toISOString()
        })
        .select('*');

    if (error) {
        console.error('❌ Failed to insert call_analytics:', error.message);
    } else {
        console.log('✅ Successfully inserted call_analytics:', data);
    }
}

testInsert();
