import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log('Fetching users from auth and users table...');
    try {
        // 1. Fetch from custom users table
        const { data: dbUsers, error: dbErr } = await supabase
            .from('users')
            .select('*');
        if (dbErr) {
            console.error('Error fetching custom users table:', dbErr.message);
        } else {
            console.log('\n--- Custom Users Table ---');
            console.log(JSON.stringify(dbUsers, null, 2));
        }

        // 2. Fetch from Supabase Auth admin API (shows emails, metadata, etc.)
        const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
        if (authErr) {
            console.error('Error listing auth users:', authErr.message);
        } else {
            console.log('\n--- Supabase Auth Users ---');
            const formattedAuthUsers = authData.users.map(u => ({
                id: u.id,
                email: u.email,
                role: u.user_metadata?.role || 'user',
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at
            }));
            console.log(JSON.stringify(formattedAuthUsers, null, 2));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}
main();
