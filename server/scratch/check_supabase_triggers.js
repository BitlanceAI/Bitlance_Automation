import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;

const db = createClient(
    'https://vtnpmdzxifcknrcrdevy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnBtZHp4aWZja25yY3JkZXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM1NzM1OSwiZXhwIjoyMDk3OTMzMzU5fQ.Zo-Ep_9HLWNeIFdfUNH_d5p7hngP4TU27XvVQNkgLBo'
);

async function checkTriggers() {
    console.log('Querying triggers and functions...');
    // We can query pg_trigger
    const { data, error } = await db.rpc('exec_sql', { sql: `
        SELECT 
            tgname AS trigger_name,
            relname AS table_name,
            proname AS function_name
        FROM pg_trigger
        JOIN pg_class ON pg_class.oid = tgrelid
        JOIN pg_proc ON pg_proc.oid = tgfoid
        WHERE relname IN ('sales_calls', 'call_analytics', 'lotlite_leads');
    ` });

    if (error) {
        // Fallback: try raw query if RPC fails
        console.error('Trigger query error:', error.message);
    } else {
        console.log('Triggers found:', JSON.stringify(data, null, 2));
    }
}

checkTriggers();
