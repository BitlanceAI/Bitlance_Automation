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
    const email = 'itm.lotlite@gmail.com';
    console.log("Checking user ID for", email);
    
    // Find the user ID in the new database
    const { data: { users }, error: usersErr } = await client.auth.admin.listUsers({
        page: 1,
        perPage: 1000
    });
    
    if (usersErr) {
        console.error("Error listing users:", usersErr);
        return;
    }
    
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
        console.error("User not found!");
        return;
    }
    
    console.log("User ID:", user.id);
    
    // Check if an organization exists for this user ID
    let { data: org, error: orgErr } = await client
        .from('organizations')
        .select('*')
        .eq('admin_id', user.id)
        .maybeSingle();
        
    if (orgErr) {
        console.error("Error fetching org:", orgErr);
        return;
    }
    
    if (!org) {
        console.log("No organization found. Creating one...");
        const { data: newOrg, error: createErr } = await client
            .from('organizations')
            .insert({
                name: 'Lotlite',
                admin_id: user.id
            })
            .select()
            .single();
            
        if (createErr) {
            console.error("Error creating org:", createErr);
            return;
        }
        org = newOrg;
        console.log("Created organization:", org);
    } else {
        console.log("Existing organization found:", org);
    }
    
    // Check if wallet exists for this org
    let { data: wallet, error: walletErr } = await client
        .from('wallet')
        .select('*')
        .eq('organization_id', org.id)
        .maybeSingle();
        
    if (walletErr) {
        console.error("Error fetching wallet:", walletErr);
        return;
    }
    
    if (!wallet) {
        console.log("No wallet found. Creating one with 8 credits (to match screenshot)...");
        const { data: newWallet, error: createWalletErr } = await client
            .from('wallet')
            .insert({
                organization_id: org.id,
                balance: 8.00
            })
            .select()
            .single();
            
        if (createWalletErr) {
            console.error("Error creating wallet:", createWalletErr);
            return;
        }
        wallet = newWallet;
        console.log("Created wallet:", wallet);
    } else {
        console.log("Existing wallet found:", wallet);
    }
    
    // Now, let's look at sales_calls in the new database
    console.log("Checking sales_calls...");
    const { data: calls, error: callsErr } = await client.from('sales_calls').select('*');
    if (callsErr) {
        console.error("Error fetching calls:", callsErr);
        return;
    }
    
    console.log("All calls in new database:", calls);
    
    // We want the call '553067' to belong to this new organization!
    console.log("Updating call '553067' to belong to organization", org.id);
    const { error: updateCallErr } = await client
        .from('sales_calls')
        .update({ organization_id: org.id })
        .eq('call_id', '553067');
        
    if (updateCallErr) {
        console.error("Error updating call 553067:", updateCallErr);
    } else {
        console.log("Successfully updated call 553067 organization mapping!");
    }
}
run();
