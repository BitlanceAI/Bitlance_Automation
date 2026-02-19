
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const token = process.argv[2];

if (!token) {
    console.error('❌ Please provide a token as an argument: node test_token.js <token>');
    process.exit(1);
}

async function validateToken() {
    console.log('🔍 Validating token...');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
        console.error('❌ Validation Failed:', error.message);
    } else {
        console.log('✅ Token is valid!');
        console.log('User ID:', user.id);
        console.log('Email:', user.email);
    }
}

validateToken();
