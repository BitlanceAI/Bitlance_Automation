import { newSupabaseAdmin } from '../src/config/supabaseClient.js';

async function addCredits() {
    const email = 'sashanksingh363@gmail.com';
    
    const { data: { users }, error } = await newSupabaseAdmin.auth.admin.listUsers();
    if (error) {
        console.error(error); return;
    }
    const user = users.find(u => u.email === email);
    if (!user) {
        console.error('User not found by email'); return;
    }

    const { data: org, error: orgErr } = await newSupabaseAdmin
        .from('organizations')
        .select('id')
        .eq('admin_id', user.id)
        .single();
        
    if (orgErr) {
        console.error('Org not found:', orgErr.message); return;
    }
    
    const { data: wallet } = await newSupabaseAdmin
        .from('wallet')
        .select('balance')
        .eq('organization_id', org.id)
        .single();
        
    const newBalance = (parseFloat(wallet?.balance || 0)) + 50;
    
    await newSupabaseAdmin
        .from('wallet')
        .update({ balance: newBalance })
        .eq('organization_id', org.id);
        
    console.log(`Successfully added 50 credits. New balance is ${newBalance}`);
}

addCredits();
