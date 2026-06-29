import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Testing delete of active_calls to check for foreign keys/errors...');
    
    const { data: activeCalls, error: fetchErr } = await supabase
        .from('active_calls')
        .select('*');
        
    if (fetchErr) {
        console.error('Fetch error:', fetchErr);
        return;
    }
    
    console.log(`Found ${activeCalls.length} active calls:`, activeCalls);
    
    if (activeCalls.length > 0) {
        for (const call of activeCalls) {
            console.log(`Attempting to delete call_id: ${call.call_id} / ID: ${call.id}`);
            const { error: deleteErr } = await supabase
                .from('active_calls')
                .delete()
                .eq('id', call.id);
                
            if (deleteErr) {
                console.error(`DELETE ERROR for ID ${call.id}:`, deleteErr);
            } else {
                console.log(`Successfully deleted ID ${call.id}`);
            }
        }
    } else {
        console.log('No active calls to delete.');
    }
    
    process.exit(0);
}

main();
