import dotenv from 'dotenv';
dotenv.config();

import { sendSignupWelcomeEmail } from './src/services/email/welcomeEmailService.js';

async function sendTestEmail() {
    const testEmail = 'rajbitlance@gmail.com';
    const testName = 'Raj (CEO)';
    const testVerificationLink = 'https://lotlite.bitlancetechhub.com'; // Placeholder — real signup generates this

    console.log(`\n📧 Sending test welcome email to: ${testEmail}...\n`);

    try {
        const result = await sendSignupWelcomeEmail(
            { email: testEmail },
            testName,
            testVerificationLink
        );

        console.log('✅ Email sent successfully!');
        console.log('Result:', result);
    } catch (err) {
        console.error('❌ Email failed to send!');
        console.error('Error:', err.message || err);
    }

    process.exit(0);
}

sendTestEmail();
