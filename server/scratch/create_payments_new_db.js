import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

async function createPaymentsTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS public.payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
            order_id TEXT UNIQUE NOT NULL,
            amount NUMERIC(10, 2) NOT NULL,
            status TEXT DEFAULT 'PENDING',
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL
        );
    `;
    console.log('Sending create payments table SQL request to NEW DB...');
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
        if (response.status === 200 || response.status === 204) {
            console.log('✅ Payments table created successfully in the new DB!');
        } else {
            console.error('Response text:', text);
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

createPaymentsTable();
