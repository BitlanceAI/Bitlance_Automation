import dotenv from 'dotenv';
dotenv.config();

import { supabaseAdmin } from './src/config/supabaseClient.js';
import { checkCreditUsageAndNotify } from './src/services/credits/creditMonitorService.js';

async function main() {
    const targetEmail = process.argv[2] || 'bitlanceai@gmail.com';
    console.log(`Setting up credit threshold test for user: ${targetEmail}`);

    try {
        // 1. Resolve user ID from auth
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        const user = users?.users?.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
        if (!user) {
            console.error(`Error: User with email "${targetEmail}" not found in Supabase Auth.`);
            return;
        }

        console.log(`Found user ID: ${user.id}`);

        // 2. Modify user_credits table to simulate 55% usage
        // Set total_credits = 100, used_credits = 55, balance = 45, and email_50_sent = false
        const { error: updateError } = await supabaseAdmin
            .from('user_credits')
            .upsert({
                user_id: user.id,
                total_credits: 100,
                used_credits: 55,
                balance: 45,
                email_50_sent: false,
                email_75_sent: false,
                email_90_sent: false,
                email_100_sent: false,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (updateError) throw updateError;
        console.log('Successfully set user_credits to: total_credits = 100, used_credits = 55, email_50_sent = false.');

        // 3. Trigger the credit monitor notification function
        console.log('Triggering credit usage monitoring scan...');
        await checkCreditUsageAndNotify();

        // 4. Verify that email_50_sent is now true
        const { data: verifyData, error: verifyError } = await supabaseAdmin
            .from('user_credits')
            .select('email_50_sent')
            .eq('user_id', user.id)
            .single();

        if (verifyError) throw verifyError;
        console.log('Verification: email_50_sent is now:', verifyData.email_50_sent);

        if (verifyData.email_50_sent) {
            console.log('\n✅ SUCCESS: The 50% credit usage email has been triggered and sent!');
            console.log('Please check your Mailtrap dashboard/email inbox.');
        } else {
            console.log('\n❌ FAILED: email_50_sent is still false. Check the console log above for errors.');
        }
    } catch (err) {
        console.error('An error occurred during testing:', err.message);
    }
}

main();
