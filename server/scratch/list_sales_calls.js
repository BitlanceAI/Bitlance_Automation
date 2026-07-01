import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;

const db = createClient(
    'https://vtnpmdzxifcknrcrdevy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnBtZHp4aWZja25yY3JkZXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM1NzM1OSwiZXhwIjoyMDk3OTMzMzU5fQ.Zo-Ep_9HLWNeIFdfUNH_d5p7hngP4TU27XvVQNkgLBo'
);

async function listSalesCalls() {
    console.log('Querying all sales_calls...');
    const { data, error } = await db.from('sales_calls').select('*');
    if (error) {
        console.error(error.message);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

listSalesCalls();
