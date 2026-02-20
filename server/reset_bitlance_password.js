
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST use Service Role Key for Admin API

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const email = 'bitlanceai@gmail.com';
const newPassword = 'admin123';

async function resetPassword() {
    console.log(`Resetting password for ${email}...`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found, creating...');
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email,
            password: newPassword,
            email_confirm: true
        });

        if (createError) {
            console.error('Error creating user:', createError);
        } else {
            console.log(`User created with ID: ${data.user.id}`);
            console.log(`Password set to: ${newPassword}`);
        }
        return;
    }

    console.log(`Found user ${user.id}, updating password...`);

    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (updateError) {
        console.error('Error updating password:', updateError);
    } else {
        console.log(`Password updated successfully to: ${newPassword}`);
    }
}

resetPassword();
