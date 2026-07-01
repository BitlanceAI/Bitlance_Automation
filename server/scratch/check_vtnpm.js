import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;

const db = createClient(
    'https://vtnpmdzxifcknrcrdevy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnBtZHp4aWZja25yY3JkZXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM1NzM1OSwiZXhwIjoyMDk3OTMzMzU5fQ.Zo-Ep_9HLWNeIFdfUNH_d5p7hngP4TU27XvVQNkgLBo'
);

async function checkDb() {
    console.log('Querying vtnpmdzxifcknrcrdevy.supabase.co...');
    const { data: sales_calls, error: scErr } = await db.from('sales_calls').select('*');
    if (scErr) {
        console.error('sales_calls error:', scErr.message);
    } else {
        console.log(`sales_calls has ${sales_calls.length} row(s)`);
    }

    const { data: call_analytics, error: caErr } = await db.from('call_analytics').select('*');
    if (caErr) {
        console.error('call_analytics error:', caErr.message);
    } else {
        console.log(`call_analytics has ${call_analytics.length} row(s)`);
        console.log(JSON.stringify(call_analytics, null, 2));
    }
}

checkDb();
