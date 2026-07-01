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
    console.log("Listing users in the OLD database auth registry...");
    const { data: { users }, error } = await client.auth.admin.listUsers({
        page: 1,
        perPage: 1000
    });
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found", users.length, "users:");
        users.forEach(u => {
            console.log(`- Email: ${u.email}, ID: ${u.id}, CreatedAt: ${u.created_at}`);
        });
    }
}
run();
