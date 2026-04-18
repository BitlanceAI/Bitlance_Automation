/**
 * One-time script: seeds the service-account.json credentials into the DB
 * as a global system credential for the Rank Tracker.
 *
 * Run once:  node scripts/seed-gsc-credentials.js
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SA_PATH = path.resolve(__dirname, '../../Ai-agents/service-account.json');

// Fixed UUID used to store global/system-level credentials
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
    console.error('❌  ENCRYPTION_KEY is not set in .env');
    process.exit(1);
}

function encryptData(text) {
    const IV_LENGTH = 16;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    console.log('📂  Reading service-account.json from:', SA_PATH);
    const sa = JSON.parse(readFileSync(SA_PATH, 'utf8'));

    const email       = sa.client_email;
    const privateKey  = sa.private_key;

    if (!email || !privateKey) {
        console.error('❌  service-account.json is missing client_email or private_key');
        process.exit(1);
    }

    console.log('🔐  Encrypting private key...');
    const encryptedKey = encryptData(privateKey);

    console.log('💾  Upserting system credentials into user_settings...');
    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: SYSTEM_USER_ID,
            google_service_email: email,
            google_private_key: encryptedKey,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

    if (error) {
        console.error('❌  Supabase error:', error.message);
        process.exit(1);
    }

    console.log('✅  Done! System GSC credentials saved.');
    console.log('    Email:', email);
    console.log('    user_id:', SYSTEM_USER_ID);
}

seed();
