import { newSupabaseAdmin } from '../src/config/supabaseClient.js';

async function check() {
    const { data: calls, error: callErr } = await newSupabaseAdmin
        .from('sales_calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
        
    if (callErr) {
        console.error(callErr);
        return;
    }
    
    console.log('--- RECENT CALLS ---');
    for (const call of calls) {
        console.log(`ID: ${call.id}, Call ID: ${call.call_id}, Customer: ${call.customer_number}`);
        console.log(`Transcript Length: ${call.transcript ? call.transcript.length : 0}`);
        console.log(`Transcript Preview: ${call.transcript ? call.transcript.substring(0, 150) : 'none'}`);
        
        // Fetch analytics
        const { data: analytics, error: analErr } = await newSupabaseAdmin
            .from('call_analytics')
            .select('*')
            .eq('call_id', call.call_id)
            .maybeSingle();
            
        if (analErr) {
            console.error('Analytics Error:', analErr);
        } else {
            console.log(`Analytics summary: ${analytics ? analytics.summary : 'not found'}`);
        }
        console.log('-------------------');
    }
}
check();
