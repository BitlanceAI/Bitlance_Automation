import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;
import dotenv from 'dotenv';
dotenv.config();

const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log("Verifying new tables in the OLD database...");
    const tables = [
        'organizations',
        'wallet',
        'sales_calls',
        'transactions',
        'payments',
        'active_calls',
        'call_analytics',
        'lotlite_leads'
    ];
    
    for (const table of tables) {
        const { data, error } = await client.from(table).select('*').limit(1);
        if (error) {
            console.log(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: Verified successfully! Rows found:`, data.length);
        }
    }
}
run();
