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
    console.log("Creating user itm.lotlite@gmail.com in the NEW database...");
    const { data, error } = await client.auth.admin.createUser({
        email: 'itm.lotlite@gmail.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
            name: 'Lotlite Admin',
            role: 'user'
        }
    });

    if (error) {
        console.error("❌ Failed to create user:", error.message);
    } else {
        console.log("✅ User created successfully in the new database!");
        console.log("User details:", data.user);
    }
}
run();
