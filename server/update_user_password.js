import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const email = process.argv[2] || 'bitlanceai@gmail.com';
    const newPassword = process.argv[3] || 'BitlanceTest123!';

    console.log(`Setting password for ${email} to: ${newPassword}`);

    try {
        // Find user by email
        const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
        if (authErr) {
            console.error('Error listing users:', authErr.message);
            return;
        }

        const user = authData.users.find(u => u.email === email);
        if (!user) {
            console.error(`User with email ${email} not found.`);
            return;
        }

        console.log(`Found user: ID=${user.id}`);

        // Update user password
        const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
            password: newPassword
        });

        if (error) {
            console.error('Error updating password:', error.message);
        } else {
            console.log(`Successfully updated password for ${email}!`);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}
main();
