import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;
import dotenv from 'dotenv';
dotenv.config();

const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function run() {
    console.log("Testing sign-in for sashanksingh363@gmail.com on OLD database...");
    const { data, error } = await client.auth.signInWithPassword({
        email: 'sashanksingh363@gmail.com',
        password: 'sash@7781'
    });
    
    if (error) {
        console.error("❌ Sign in failed:", error.message);
    } else {
        console.log("✅ Sign in successful! Session token:", data.session.access_token);
    }
}
run();
