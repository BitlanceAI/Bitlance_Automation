import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Finding sales_calls with status "active" and updating to "completed"...');
    
    const { data: calls, error: fetchErr } = await supabase
        .from('sales_calls')
        .select('*')
        .eq('status', 'active');
        
    if (fetchErr) {
        console.error('Fetch error:', fetchErr);
        return;
    }
    
    console.log(`Found ${calls.length} calls with status "active":`, calls.map(c => ({ id: c.id, call_id: c.call_id })));
    
    if (calls.length > 0) {
        for (const call of calls) {
            const { data: updatedCall, error: updateErr } = await supabase
                .from('sales_calls')
                .update({ status: 'completed' })
                .eq('id', call.id)
                .select();
                
            if (updateErr) {
                console.error(`Update error for ID ${call.id}:`, updateErr);
            } else {
                console.log(`Successfully updated call ID ${call.id} status to "completed"`);
            }
        }
    } else {
        console.log('No active calls in sales_calls table.');
    }
    
    process.exit(0);
}

main();
