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
    console.log("Checking tables in the OLD database...");
    const tables = ['organizations', 'wallet', 'sales_calls', 'active_calls', 'transactions', 'call_analytics', 'payments', 'lotlite_leads'];
    
    for (const table of tables) {
        const { error } = await client.from(table).select('id').limit(1);
        if (error) {
            console.log(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: Exists`);
        }
    }
}
run();
