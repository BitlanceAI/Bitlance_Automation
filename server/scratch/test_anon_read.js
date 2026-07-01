import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;
import dotenv from 'dotenv';
dotenv.config();

// Initialize with the NEW Supabase Anon Key (like the frontend does)
const client = createClient(
    process.env.NEW_SUPABASE_URL,
    process.env.NEW_SUPABASE_KEY // This is the anon key
);

async function run() {
    console.log("Attempting to read lotlite_leads with Anon Key...");
    const { data, error } = await client
        .from("lotlite_leads")
        .select("id, call_id, first_name, full_name");
        
    if (error) {
        console.error("❌ Error reading with Anon Key:", error);
    } else {
        console.log("✅ Success! Read leads count:", data.length);
        console.log("Leads data:", data);
    }
}
run();
