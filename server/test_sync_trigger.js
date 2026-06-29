import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const userId = 'f964f465-aa99-4d5a-8682-e7fd80b60ded'; // sashanksingh12205@gmail.com
    const orgId = '3d5f7842-b803-4280-8a7c-947ebf0a57a1';
    
    console.log('Testing sync trigger...');
    console.log('Updating wallet balance to 450.50...');
    
    try {
        // Update wallet
        const { error: uErr } = await supabase
            .from('wallet')
            .update({ balance: 450.50 })
            .eq('organization_id', orgId);
            
        if (uErr) {
            console.error('Error updating wallet:', uErr.message);
            return;
        }
        
        console.log('Updated wallet successfully. Waiting 1 second for triggers to fire...');
        await new Promise(r => setTimeout(r, 1000));
        
        // Fetch wallet and user_credits
        const { data: wallet } = await supabase
            .from('wallet')
            .select('balance')
            .eq('organization_id', orgId)
            .single();
            
        const { data: credits } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();
            
        console.log('Resulting Wallet Balance:', wallet?.balance);
        console.log('Resulting User Credits:', credits?.balance);
        
        // Restore to 500
        await supabase
            .from('wallet')
            .update({ balance: 500 })
            .eq('organization_id', orgId);
            
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}
main();
