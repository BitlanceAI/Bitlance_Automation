import { oldSupabaseAdmin } from '/home/codebloodedsash/automation bitlance/Bitlance_Automation/server/src/config/supabaseClient.js';

async function deleteAdminUserOldDb() {
    const email = 'bookishalok@gmail.com';
    
    console.log(`Starting deletion for ${email} from OLD DB...`);

    try {
        const { data: listData } = await oldSupabaseAdmin.auth.admin.listUsers();
        const existing = listData?.users?.find(u => u.email === email);
        
        if (existing) {
            const { error: delError } = await oldSupabaseAdmin.auth.admin.deleteUser(existing.id);
            if (delError) {
                console.error('Failed to delete from OLD DB:', delError.message);
            } else {
                console.log(`✅ Successfully deleted user ${email} from OLD DB.`);
            }
        } else {
            console.log(`User ${email} not found in OLD DB.`);
        }

        console.log('Process complete!');
        process.exit(0);

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

deleteAdminUserOldDb();
