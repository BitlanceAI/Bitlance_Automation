import { newSupabaseAdmin } from '../src/config/supabaseClient.js';
async function run() {
    const { data } = await newSupabaseAdmin.from('sales_calls').select('agent_id').order('created_at', { ascending: false });
    const agents = [...new Set(data.map(d => d.agent_id))];
    console.log('Unique Agent IDs:', agents);
}
run();
