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
    const userId = '3457be44-ca7a-4c36-8a67-5d7b6d63bec8';
    console.log("Checking user sashanksingh363@gmail.com organization and wallet in OLD database...");
    
    // Check organizations
    const { data: org, error: orgErr } = await client
        .from('organizations')
        .select('*')
        .eq('admin_id', userId)
        .maybeSingle();
        
    if (orgErr) {
        console.error("Error fetching org:", orgErr);
        return;
    }
    
    if (!org) {
        console.log("❌ Organization not found in old database. We will auto-seed it on their first login or we can create it now!");
    } else {
        console.log("✅ Organization found:", org);
        // Check wallet
        const { data: wallet, error: walletErr } = await client
            .from('wallet')
            .select('*')
            .eq('organization_id', org.id)
            .maybeSingle();
            
        if (walletErr) {
            console.error("Error fetching wallet:", walletErr);
        } else if (!wallet) {
            console.log("❌ Wallet not found in old database.");
        } else {
            console.log("✅ Wallet found:", wallet);
        }
    }
}
run();
