import dotenv from 'dotenv';
dotenv.config();

import ws from 'ws';
global.WebSocket = ws;

import { createClient } from '@supabase/supabase-js';

const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
);

async function setupUsers() {
    const { data: usersData } = await client.auth.admin.listUsers({ perPage: 1000 });
    let bookishalok = usersData.users.find(u => u.email === 'bookishalok@gmail.com');
    let lotlite = usersData.users.find(u => u.email === 'itm.lotlite@gmail.com');

    // 1. Setup bookishalok
    if (bookishalok) {
        await client.auth.admin.updateUserById(bookishalok.id, { password: 'admin123' });
        console.log('✅ Updated bookishalok password to admin123');
    } else {
        console.log('❌ bookishalok not found!');
    }

    // 2. Setup itm.lotlite
    if (!lotlite) {
        const { data: newUser, error } = await client.auth.admin.createUser({
            email: 'itm.lotlite@gmail.com',
            password: 'admin123',
            email_confirm: true,
            user_metadata: { name: 'ITM Lotlite Admin', role: 'admin' }
        });
        if (error) {
            console.error('❌ Failed to create lotlite:', error);
        } else {
            lotlite = newUser.user;
            console.log('✅ Created itm.lotlite with password admin123');
        }
    } else {
        await client.auth.admin.updateUserById(lotlite.id, { password: 'admin123' });
        console.log('✅ Updated itm.lotlite password to admin123');
    }

    // Ensure credits exist for both (they will share visually but need records)
    if (lotlite) {
        await client.from('user_credits').upsert({
            user_id: lotlite.id,
            balance: 10,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        console.log('✅ Initialized dummy credits for lotlite');
    }
}

setupUsers();
