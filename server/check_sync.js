import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const userId = 'f964f465-aa99-4d5a-8682-e7fd80b60ded'; // sashanksingh12205@gmail.com
    
    console.log(`Checking database sync for user ID: ${userId}`);
    
    try {
        // 1. Get user_credits
        const { data: credits, error: cErr } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
            
        console.log('user_credits row:', credits || 'NOT FOUND', cErr ? cErr.message : '');

        // 2. Get organizations
        const { data: org, error: oErr } = await supabase
            .from('organizations')
            .select('*')
            .eq('admin_id', userId)
            .maybeSingle();
            
        console.log('organizations row:', org || 'NOT FOUND', oErr ? oErr.message : '');

        if (org) {
            // 3. Get wallet
            const { data: wallet, error: wErr } = await supabase
                .from('wallet')
                .select('*')
                .eq('organization_id', org.id)
                .maybeSingle();
                
            console.log('wallet row:', wallet || 'NOT FOUND', wErr ? wErr.message : '');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}
main();
