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
    const { data: { users }, error } = await client.auth.admin.listUsers();
    if (error) {
        console.error("Error listing old db users:", error);
    } else {
        console.log("Old DB Users:");
        users.forEach(u => {
            console.log(`- Email: ${u.email}, ID: ${u.id}`);
        });
    }
}
run();
