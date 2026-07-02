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
    console.log("Checking user 'itm.lotlite@gmail.com' in the OLD database...");
    const { data: { users }, error: usersErr } = await client.auth.admin.listUsers({
        page: 1,
        perPage: 1000
    });
    if (usersErr) {
        console.error("Error listing users:", usersErr);
        return;
    }
    
    const user = users.find(u => u.email?.toLowerCase() === 'itm.lotlite@gmail.com');
    if (!user) {
        console.log("❌ User not found in old auth registry!");
        return;
    }
    
    console.log("User ID:", user.id);
    
    // Check organizations
    const { data: org, error: orgErr } = await client
        .from('organizations')
        .select('*')
        .eq('admin_id', user.id)
        .maybeSingle();
        
    if (orgErr) {
        console.error("Error fetching org:", orgErr);
        return;
    }
    
    if (!org) {
        console.log("❌ Organization not found in old database.");
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
