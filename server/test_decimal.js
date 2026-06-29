import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Testing decimal update on wallet balance...');
    
    const { data: original, error: fErr } = await supabase
        .from('wallet')
        .select('*')
        .single();
        
    if (fErr) {
        console.error('Fetch error:', fErr);
        return;
    }
    
    console.log('Current wallet:', original);
    
    const testVal = 488.59;
    console.log(`Updating wallet balance to decimal: ${testVal}...`);
    
    const { data: updated, error: uErr } = await supabase
        .from('wallet')
        .update({ balance: testVal })
        .eq('id', original.id)
        .select()
        .single();
        
    if (uErr) {
        console.error('Update error:', uErr);
        return;
    }
    
    console.log('Updated wallet response:', updated);
    
    // Read back to confirm
    const { data: readBack } = await supabase
        .from('wallet')
        .select('*')
        .single();
        
    console.log('Read back wallet:', readBack);
    
    // Restore original balance
    await supabase
        .from('wallet')
        .update({ balance: original.balance })
        .eq('id', original.id);
        
    console.log('Restored original balance.');
    
    process.exit(0);
}

main();
