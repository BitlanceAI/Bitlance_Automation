/**
 * Run migration: add delay_minutes to auto_blog_settings
 * Usage: node run_migration.js
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
);

const sql = `
ALTER TABLE auto_blog_settings 
  ADD COLUMN IF NOT EXISTS delay_minutes INTEGER NOT NULL DEFAULT 300;

UPDATE auto_blog_settings SET delay_minutes = 300 WHERE delay_minutes IS NULL;
`;

console.log('Running migration: add delay_minutes to auto_blog_settings...');

const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(() => ({ error: 'rpc_not_available' }));

if (error === 'rpc_not_available' || error) {
    // Fallback: use the REST API with raw SQL via pg endpoint if available
    console.log('Direct RPC not available. Trying raw query via supabase-js...');

    // Try adding the column via supabase-js using a workaround
    // We'll insert/upsert a settings row to ensure it exists first
    const { error: upsertError } = await supabase
        .from('auto_blog_settings')
        .upsert({ id: 1, is_enabled: false, delay_minutes: 300 }, { onConflict: 'id', ignoreDuplicates: true });

    if (upsertError && upsertError.code === '42703') {
        console.log('❌ Column delay_minutes does not exist yet.');
        console.log('');
        console.log('📋 Please run the following SQL in your Supabase Dashboard → SQL Editor:');
        console.log('');
        console.log('ALTER TABLE auto_blog_settings ADD COLUMN IF NOT EXISTS delay_minutes INTEGER NOT NULL DEFAULT 300;');
        console.log('UPDATE auto_blog_settings SET delay_minutes = 300 WHERE delay_minutes IS NULL;');
        console.log('');
    } else if (upsertError) {
        console.log('❌ Migration error:', upsertError.message);
        console.log('');
        console.log('📋 Please run the following SQL in your Supabase Dashboard → SQL Editor:');
        console.log('');
        console.log('ALTER TABLE auto_blog_settings ADD COLUMN IF NOT EXISTS delay_minutes INTEGER NOT NULL DEFAULT 300;');
        console.log('UPDATE auto_blog_settings SET delay_minutes = 300 WHERE delay_minutes IS NULL;');
    } else {
        console.log('✅ Settings row exists/created. If delay_minutes column is missing, run the SQL in Supabase Dashboard.');
    }
} else {
    console.log('✅ Migration applied successfully!');
}
