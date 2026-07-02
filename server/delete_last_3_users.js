import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEW_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const newDb = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const PROTECTED_EMAIL = 'bookishalok@gmail.com';

async function deleteLastThreeUsers() {
    // Fetch all users sorted by creation date (newest first)
    const { data, error } = await newDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) { console.error('Failed to list users:', error.message); process.exit(1); }

    // Filter out the protected admin
    const eligible = data.users
        .filter(u => u.email?.toLowerCase() !== PROTECTED_EMAIL.toLowerCase())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const toDelete = eligible.slice(0, 3);

    if (toDelete.length === 0) {
        console.log('No users to delete.');
        process.exit(0);
    }

    console.log('\n🗑️  Users to be deleted:\n');
    toDelete.forEach(u => console.log(`  - ${u.email} (created: ${new Date(u.created_at).toLocaleString()})`));
    console.log('');

    for (const user of toDelete) {
        const { error: delErr } = await newDb.auth.admin.deleteUser(user.id);
        if (delErr) {
            console.error(`❌ Failed to delete ${user.email}:`, delErr.message);
        } else {
            console.log(`✅ Deleted: ${user.email}`);
        }
    }

    console.log('\n✅ Done!');
    process.exit(0);
}

deleteLastThreeUsers();
