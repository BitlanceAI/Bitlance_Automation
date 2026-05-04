import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const addCredits = async () => {
    try {
        console.log('Fetching users...');
        // Get all users from auth (admin only usually, but we might just update user_credits table directly if we don't have admin access to list users easily without service role)
        // Since we might not have service role key easily available or it might be same as SUPABASE_KEY if not configured strictly.
        // Let's try to update all rows in user_credits table.

        const { data: users, error: fetchError } = await supabase
            .from('user_credits')
            .select('user_id, balance');

        if (fetchError) {
            throw fetchError;
        }

        console.log(`Found ${users.length} users in user_credits table.`);

        for (const user of users) {
            const newBalance = (user.balance || 0) + 1000;
            console.log(`Updating user ${user.user_id}: ${user.balance} -> ${newBalance}`);

            const { error: updateError } = await supabase
                .from('user_credits')
                .update({ balance: newBalance })
                .eq('user_id', user.user_id);

            if (updateError) {
                console.error(`Failed to update user ${user.user_id}:`, updateError.message);
            } else {
                console.log(`Successfully updated user ${user.user_id}`);
            }
        }

        console.log('Done adding credits.');

    } catch (error) {
        console.error('Error adding credits:', error);
    }
};

addCredits();
