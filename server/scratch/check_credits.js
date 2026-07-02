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

async function checkCredits() {
    const { data: usersData } = await client.auth.admin.listUsers();
    const user = usersData.users.find(u => u.email === 'bookishalok@gmail.com');
    
    if (!user) {
        console.log('User not found.');
        return;
    }

    const { data: credits } = await client.from('user_credits').select('*').eq('user_id', user.id).single();
    console.log(`User: ${user.email}`);
    console.log(`Balance: ${credits ? credits.balance : 'No credit record found'}`);
}

checkCredits();
