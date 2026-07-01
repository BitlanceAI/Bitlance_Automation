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

async function addCredits() {
    const { data: usersData } = await client.auth.admin.listUsers();
    const user = usersData.users.find(u => u.email === 'bookishalok@gmail.com');
    
    if (!user) {
        console.log('User not found.');
        return;
    }

    const { data: credits } = await client.from('user_credits').select('*').eq('user_id', user.id).single();
    if (!credits) {
        console.log('No credit record found for user.');
        return;
    }

    const newBalance = credits.balance + 50;
    const { error } = await client.from('user_credits').update({ balance: newBalance }).eq('user_id', user.id);
    
    if (error) {
        console.error('Error updating credits:', error);
    } else {
        console.log(`Successfully added 50 credits. Old balance: ${credits.balance}, New balance: ${newBalance}`);
    }
}

addCredits();
