import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Connecting to Supabase to update credits for dummy user...');
    
    const dummyUserId = '0d396440-7d07-407c-89da-9cb93e353347';
    
    // 1. Get org for dummy user
    const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .select('*')
        .eq('admin_id', dummyUserId)
        .single();
        
    if (orgErr) {
        console.error('Error finding org:', orgErr);
        return;
    }
    
    console.log('Found dummy organization:', org.id);
    
    // 2. Update wallet
    const { data: wallet, error: walletErr } = await supabase
        .from('wallet')
        .update({ balance: 500 })
        .eq('organization_id', org.id)
        .select()
        .single();
        
    if (walletErr) {
        console.error('Error updating wallet:', walletErr);
        return;
    }
    
    console.log('Success! Wallet balance updated to:', wallet.balance);
    process.exit(0);
}

main();
