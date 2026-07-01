import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;
import dotenv from 'dotenv';
dotenv.config();

const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log("--- OLD ORGANIZATIONS ---");
    const { data: orgs, error: orgsErr } = await client.from('organizations').select('*');
    if (orgsErr) console.error("Error orgs:", orgsErr);
    else console.log(orgs);

    console.log("--- OLD WALLETS ---");
    const { data: wallets, error: walletsErr } = await client.from('wallet').select('*');
    if (walletsErr) console.error("Error wallets:", walletsErr);
    else console.log(wallets);
}
run();
