import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const email = 'sashanksingh12205@gmail.com';
    console.log(`Resetting balance to 200 for user: ${email}...`);

    try {
        const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
        if (authErr) throw authErr;

        const user = authData.users.find(u => u.email === email);
        if (!user) {
            console.error(`User ${email} not found.`);
            process.exit(1);
        }
        
        console.log(`Found user: ID=${user.id}`);

        // 1. Update user_credits table
        const { data: creditData, error: creditErr } = await supabase
            .from('user_credits')
            .update({ balance: 200 })
            .eq('user_id', user.id)
            .select();

        if (creditErr) {
            console.error('Error updating user_credits:', creditErr.message);
        } else {
            console.log('Successfully updated user_credits:', creditData);
        }

        // 2. Update wallet table (through organization)
        const { data: orgs, error: orgErr } = await supabase
            .from('organizations')
            .select('id')
            .eq('admin_id', user.id);

        if (orgErr) throw orgErr;
        
        if (orgs && orgs.length > 0) {
            for (const org of orgs) {
                const { data: walletData, error: walletErr } = await supabase
                    .from('wallet')
                    .update({ balance: 200 })
                    .eq('organization_id', org.id)
                    .select();

                if (walletErr) {
                    console.error(`Error updating wallet for org ${org.id}:`, walletErr.message);
                } else {
                    console.log(`Successfully updated wallet for org ${org.id}:`, walletData);
                }
            }
        } else {
            console.log('No organization found for this user to update wallet.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}
main();
