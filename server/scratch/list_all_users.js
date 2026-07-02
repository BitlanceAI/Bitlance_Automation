import dotenv from 'dotenv';
dotenv.config();

import ws from 'ws';
global.WebSocket = ws;

import { createClient } from '@supabase/supabase-js';

const oldDb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const newDb = createClient(process.env.NEW_SUPABASE_URL, process.env.NEW_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function listAll() {
    console.log('--- OLD DATABASE USERS ---');
    try {
        const { data: oldUsers, error: oldErr } = await oldDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (oldErr) {
            console.error('Error fetching old DB users:', oldErr.message);
        } else {
            oldUsers.users.forEach(u => {
                console.log(`- Email: ${u.email} | ID: ${u.id} | Created: ${new Date(u.created_at).toLocaleString()}`);
            });
            console.log(`Total: ${oldUsers.users.length}\n`);
        }
    } catch (e) {
        console.error(e);
    }

    console.log('--- NEW DATABASE USERS ---');
    try {
        const { data: newUsers, error: newErr } = await newDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (newErr) {
            console.error('Error fetching new DB users:', newErr.message);
        } else {
            newUsers.users.forEach(u => {
                console.log(`- Email: ${u.email} | ID: ${u.id} | Created: ${new Date(u.created_at).toLocaleString()}`);
            });
            console.log(`Total: ${newUsers.users.length}\n`);
        }
    } catch (e) {
        console.error(e);
    }

    process.exit(0);
}

listAll();
