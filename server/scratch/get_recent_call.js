import { newSupabaseAdmin } from '../src/config/supabaseClient.js';
async function run() {
    const { data } = await newSupabaseAdmin.from('sales_calls').select('call_id').order('created_at', { ascending: false }).limit(1);
    console.log(data);
}
run();
