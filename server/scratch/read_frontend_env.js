import fs from 'fs';
import path from 'path';

const envPath = '/home/codebloodedsash/automation bitlance/billing-dashboard/.env.local';
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    console.log('Frontend .env.local keys:');
    for (const line of lines) {
        if (line.includes('SUPABASE') || line.includes('URL') || line.includes('KEY')) {
            const parts = line.split('=');
            console.log(`- ${parts[0]}: ${parts[1] ? 'PRESENT (len ' + parts[1].length + ')' : 'EMPTY'}`);
        }
    }
} else {
    console.log('.env.local does not exist');
}
