import dotenv from 'dotenv';
dotenv.config();

import { sendMailtrapEmail } from './src/services/email/mailtrapService.js';

async function test() {
    console.log('Sending test email via Mailtrap...');
    const res = await sendMailtrapEmail(
        'bitlanceai@gmail.com',
        'Test from Bitlance Credit Monitor',
        '<h1>Test Email</h1><p>If you see this, Mailtrap SMTP is working perfectly.</p>'
    );
    console.log('Result:', res);
}

test();
