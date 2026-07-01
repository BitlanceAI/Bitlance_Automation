import { oldSupabaseAdmin } from './src/config/supabaseClient.js';

async function createAdminUser() {
    const email = 'bookishalok@gmail.com';
    const password = 'Alok123#';
    
    console.log(`Starting admin creation for ${email}...`);

    try {
        // Create in database
        const { data: oldUser, error: oldError } = await oldSupabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                name: 'Alok (Admin)',
                role: 'admin'
            }
        });

        let oldUserId = oldUser?.user?.id;

        if (oldError) {
            console.error('Failed to create in DB:', oldError.message);
            // If already exists, fetch the ID
            if (oldError.message.includes('already registered')) {
                const { data: listData } = await oldSupabaseAdmin.auth.admin.listUsers();
                const existing = listData?.users?.find(u => u.email === email);
                if (existing) oldUserId = existing.id;
            }
        } else {
            console.log('✅ Created user in DB. ID:', oldUserId);
        }

        // Initialize Admin Credits in database
        if (oldUserId) {
            const { error: creditError } = await oldSupabaseAdmin
                .from('user_credits')
                .upsert({
                    user_id: oldUserId,
                    balance: 999999, // Infinite credits for admin
                    total_credits: 999999,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (creditError) {
                console.error('Failed to init credits in DB:', creditError.message);
            } else {
                console.log('✅ Initialized admin credits in DB.');
            }
        }
        
        console.log('Process complete!');
        process.exit(0);

    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

createAdminUser();
