import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

async function alterTable() {
    const sql = `ALTER TABLE public.wallet ALTER COLUMN balance TYPE NUMERIC(10, 2);`;
    console.log('Sending alter table SQL request to Supabase...');
    try {
        const response = await fetch(`${process.env.NEW_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.NEW_SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.NEW_SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql })
        });
        const text = await response.text();
        console.log('Response status:', response.status);
        console.log('Response text:', text);
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

alterTable();
