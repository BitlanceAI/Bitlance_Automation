import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const run = async () => {
    try {
        console.log("Fetching users with service role key...");
        const { data: usersData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error("Error fetching users:", authError.message);
            return;
        }

        const users = usersData.users;
        const targetUser = users.find(u => u.email && u.email.includes('bitlanceai'));

        if (!targetUser) {
            console.log("No user found with 'bitlanceai' in email. Here are the available emails:");
            users.forEach(u => console.log(u.email));
            return;
        }

        console.log(`Found target user: ${targetUser.email} (ID: ${targetUser.id})`);

        // Check if row exists in user_credits
        const { data: userCredits, error: ucError } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', targetUser.id)
            .single();

        let newBalance = 45000;
        if (userCredits) {
            newBalance = (userCredits.balance || 0) + 45000;
            console.log(`Current balance: ${userCredits.balance}. Adding 45000...`);
            const { error: updateError } = await supabase
                .from('user_credits')
                .update({ balance: newBalance })
                .eq('user_id', targetUser.id);
            
            if (updateError) {
                console.error("Failed to update credits:", updateError);
            } else {
                console.log(`Successfully updated balance to ${newBalance}`);
            }
        } else {
            console.log("No existing credit record found. Inserting new record...");
            const { error: insertError } = await supabase
                .from('user_credits')
                .insert({ user_id: targetUser.id, balance: 45000 });
            
            if (insertError) {
                console.error("Failed to insert credits:", insertError);
            } else {
                console.log("Successfully inserted new credit record with 45000 credits.");
            }
        }
    } catch (e) {
        console.error(e);
    }
};
run();
