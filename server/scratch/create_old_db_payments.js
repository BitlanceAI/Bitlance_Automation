import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;
import dotenv from 'dotenv';
dotenv.config();

const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createPaymentsTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS public.payments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID,
            order_id TEXT UNIQUE NOT NULL,
            amount NUMERIC(10, 2) NOT NULL,
            status TEXT DEFAULT 'PENDING',
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL
        );
    `;
    console.log('Sending create payments table SQL request to OLD DB...');
    try {
        const { data, error } = await client.rpc('exec_sql', { sql });
        if (error) {
            console.error('RPC Error:', error.message);
        } else {
            console.log('✅ Payments table created successfully in the OLD DB!');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

createPaymentsTable();
