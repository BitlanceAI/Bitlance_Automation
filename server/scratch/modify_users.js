import dotenv from 'dotenv';
dotenv.config();

import ws from 'ws';
global.WebSocket = ws;

import { createClient } from '@supabase/supabase-js';

const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: { autoRefreshToken: false, persistSession: false }
    }
);

async function run() {
    console.log("Starting DB modifications on the old database...");

    const alokEmail = 'bookishalok@gmail.com';
    const lotliteEmail = 'itm.lotlite@gmail.com';

    // 1. Modify bookishalok@gmail.com
    console.log(`\n🔍 Searching for user ${alokEmail}...`);
    const { data: listData, error: listErr } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) {
        console.error('Failed to list users:', listErr.message);
        process.exit(1);
    }

    const alokUser = listData?.users?.find(u => u.email?.toLowerCase() === alokEmail.toLowerCase());
    if (alokUser) {
        console.log(`Found ${alokEmail} with ID: ${alokUser.id}. Modifying...`);

        // A. Reset password & update metadata in auth.users
        const { error: updateAuthErr } = await client.auth.admin.updateUserById(alokUser.id, {
            password: 'Alok123#',
            user_metadata: {
                name: 'Alok',
                role: 'user'
            }
        });
        if (updateAuthErr) {
            console.error(`❌ Failed to update auth metadata/password for ${alokEmail}:`, updateAuthErr.message);
        } else {
            console.log(`✅ Reset password to "Alok123#" and updated role metadata to "user" for ${alokEmail} in auth.users.`);
        }

        // B. Update public.users table if it exists
        const { error: publicUserErr } = await client
            .from('users')
            .update({ role: 'user', name: 'Alok' })
            .eq('id', alokUser.id);
        
        if (publicUserErr) {
            console.log(`ℹ️ public.users update note (table might not exist or be structured differently):`, publicUserErr.message);
        } else {
            console.log(`✅ Updated role and name for ${alokEmail} in public.users table.`);
        }

        // C. Remove infinite admin credits (reset to standard 10 starting credits)
        const { error: creditsErr } = await client
            .from('user_credits')
            .upsert({
                user_id: alokUser.id,
                balance: 10,
                total_credits: 10,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        
        if (creditsErr) {
            console.error(`❌ Failed to reset user credits for ${alokEmail}:`, creditsErr.message);
        } else {
            console.log(`✅ Reset credits balance to 10 for ${alokEmail} in user_credits table.`);
        }
    } else {
        console.log(`⚠️ User ${alokEmail} was not found in the old database.`);
    }

    // 2. Delete itm.lotlite@gmail.com
    console.log(`\n🔍 Searching for user ${lotliteEmail}...`);
    const lotliteUser = listData?.users?.find(u => u.email?.toLowerCase() === lotliteEmail.toLowerCase());
    if (lotliteUser) {
        console.log(`Found ${lotliteEmail} with ID: ${lotliteUser.id}. Deleting...`);

        // A. Delete from public tables first (cleanup)
        try {
            await client.from('user_credits').delete().eq('user_id', lotliteUser.id);
            await client.from('users').delete().eq('id', lotliteUser.id);
            console.log(`✅ Cleaned up references for ${lotliteEmail} in public.user_credits and public.users.`);
        } catch (e) {
            console.log(`Note during public table cleanup:`, e.message);
        }

        // B. Delete from auth.users
        const { error: delErr } = await client.auth.admin.deleteUser(lotliteUser.id);
        if (delErr) {
            console.error(`❌ Failed to delete ${lotliteEmail} from auth.users:`, delErr.message);
        } else {
            console.log(`✅ Successfully deleted ${lotliteEmail} from auth.users.`);
        }
    } else {
        console.log(`⚠️ User ${lotliteEmail} was not found in the old database.`);
    }

    console.log('\nDB modifications completed successfully.');
    process.exit(0);
}

run();
