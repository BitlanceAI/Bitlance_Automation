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
    const email = 'sashanksingh363@gmail.com';
    const newPassword = 'sash@7781';
    
    console.log(`Setting password for user ${email} to ${newPassword} in the OLD database...`);
    
    // Find user ID
    const { data: { users }, error: listErr } = await client.auth.admin.listUsers({
        page: 1,
        perPage: 1000
    });
    if (listErr) {
        console.error("Error listing users:", listErr);
        return;
    }
    
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
        console.error("User not found!");
        return;
    }
    
    // Update password
    const { data, error } = await client.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );
    
    if (error) {
        console.error("❌ Failed to update password:", error.message);
    } else {
        console.log("✅ Password updated successfully!");
        console.log("Updated user:", data.user);
    }
}
run();
