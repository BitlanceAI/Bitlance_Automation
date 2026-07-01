import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;
import dotenv from 'dotenv';
dotenv.config();

const client = createClient(
    process.env.NEW_SUPABASE_URL,
    process.env.NEW_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log("Checking RLS on lotlite_leads...");
    
    // We try to call exec_sql to disable RLS
    const sql = `ALTER TABLE public.lotlite_leads DISABLE ROW LEVEL SECURITY;`;
    
    const { data, error } = await client.rpc('exec_sql', { sql });
    
    if (error) {
        console.error("❌ RPC exec_sql failed:", error.message);
        
        // Try direct HTTP endpoint
        console.log("Trying direct SQL endpoint...");
        try {
            const response = await fetch(`${process.env.NEW_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEW_SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${process.env.NEW_SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({ sql })
            });
            const text = await response.text();
            if (response.ok) {
                console.log("✅ Success via HTTP SQL endpoint!");
            } else {
                console.error("❌ HTTP SQL endpoint failed:", text);
            }
        } catch (e) {
            console.error("❌ HTTP SQL request error:", e.message);
        }
    } else {
        console.log("✅ Success! RLS disabled on lotlite_leads:", data);
    }
}
run();
