import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Querying table information to check column data types...');
    
    // We can query pg_catalog or information_schema using SQL
    // Since we don't have direct SQL client, we can execute an RPC or query via API
    // Wait, let's see if we can read columns by checking the fields on wallet
    // Or we can fetch one transaction to see its data type
    
    const { data: cols, error } = await supabase
        .from('wallet')
        .select('*')
        .limit(1);
        
    if (error) {
        console.error('Error fetching wallet:', error);
        return;
    }
    
    console.log('Wallet columns keys:', Object.keys(cols[0] || {}));
    
    // Let's query information_schema if there's a custom function or check transaction values
    const { data: txs, error: txErr } = await supabase
        .from('transactions')
        .select('*')
        .limit(5);
        
    if (txErr) {
        console.error('Transactions error:', txErr);
    } else {
        console.log('Sample transactions:', txs);
    }
    
    process.exit(0);
}

main();
