import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;
import dotenv from 'dotenv';
dotenv.config();

const client = createClient(
    process.env.NEW_SUPABASE_URL,
    process.env.NEW_SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    const { data: leads } = await client.from('lotlite_leads').select('*');
    console.log(JSON.stringify(leads, null, 2));
}
run();
