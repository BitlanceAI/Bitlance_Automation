import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching wallet balance and sales_calls history...');
    
    const { data: wallets, error: wErr } = await supabase
        .from('wallet')
        .select('*');
        
    if (wErr) {
        console.error('Wallet error:', wErr);
        return;
    }
    
    console.log('Wallets:', wallets);
    
    const { data: calls, error: cErr } = await supabase
        .from('sales_calls')
        .select('*')
        .order('started_at', { ascending: false });
        
    if (cErr) {
        console.error('Calls error:', cErr);
        return;
    }
    
    console.log('Sales Calls Total:', calls.length);
    console.log('Sales Calls:', calls.map(c => ({
        started_at: c.started_at,
        duration: c.duration,
        credits_used: c.credits_used,
        status: c.status
    })));
    
    process.exit(0);
}

main();
