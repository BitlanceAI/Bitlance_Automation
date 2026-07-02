import { newSupabaseAdmin } from '../src/config/supabaseClient.js';

async function addCredits() {
    const email = 'sashanksingh363@gmail.com';
    
    // 1. Get user id from users_registry
    const { data: user, error: userErr } = await newSupabaseAdmin
        .from('users_registry')
        .select('id')
        .eq('email', email)
        .single();
        
    if (userErr) {
        console.error('User not found:', userErr.message);
        return;
    }

    // 2. Get organization id
    const { data: org, error: orgErr } = await newSupabaseAdmin
        .from('organizations')
        .select('id')
        .eq('admin_id', user.id)
        .single();
        
    if (orgErr) {
        console.error('Org not found:', orgErr.message);
        return;
    }
    
    // 3. Update wallet
    const { data: wallet, error: walletErr } = await newSupabaseAdmin
        .from('wallet')
        .select('balance')
        .eq('organization_id', org.id)
        .single();
        
    if (walletErr) {
        console.error('Wallet not found:', walletErr.message);
        return;
    }
    
    const newBalance = parseFloat(wallet.balance) + 50;
    
    const { error: updateErr } = await newSupabaseAdmin
        .from('wallet')
        .update({ balance: newBalance })
        .eq('organization_id', org.id);
        
    if (updateErr) {
        console.error('Failed to update wallet:', updateErr.message);
    } else {
        console.log(`Successfully added 50 credits. New balance is ${newBalance}`);
    }
}

addCredits();
