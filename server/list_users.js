import dotenv from 'dotenv';
dotenv.config();

import ws from 'ws';
global.WebSocket = ws;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEW_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const newDb = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function listUsers() {
    const { data, error } = await newDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) { 
        console.error('Failed to list users:', error.message); 
        process.exit(1); 
    }

    console.log('\n👥 Saved Users in New Database:\n');
    data.users.forEach(u => {
        console.log(`- Email: ${u.email} | ID: ${u.id} | Created: ${new Date(u.created_at).toLocaleString()}`);
    });
    console.log(`\nTotal Users: ${data.users.length}`);
    process.exit(0);
}

listUsers();
