import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key like scheduler

console.log('Testing Supabase Connection with Service Role Key...');
console.log('URL:', SUPABASE_URL);
// console.log('Key:', SUPABASE_KEY); // Don't log key

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

async function testConnection() {
    try {
        console.log('Attempting to fetch pending scheduled posts...');
        const { data, error } = await supabase
            .from('scheduled_posts')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Supabase Request Failed:', error);
        } else {
            console.log('✅ Connection Successful! Found', data.length, 'posts.');
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

testConnection();
