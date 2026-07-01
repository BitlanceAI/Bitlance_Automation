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
    console.log("--- NEW ORGANIZATIONS ---");
    const { data: orgs } = await client.from('organizations').select('*');
    console.log(orgs);

    console.log("--- NEW WALLETS ---");
    const { data: wallets } = await client.from('wallet').select('*');
    console.log(wallets);
}
run();
