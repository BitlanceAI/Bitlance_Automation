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
    console.log("Checking sales_calls in the OLD database...");
    const { data: calls, error } = await client.from('sales_calls').select('*');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found", calls.length, "calls:");
        console.log(calls);
    }
}
run();
