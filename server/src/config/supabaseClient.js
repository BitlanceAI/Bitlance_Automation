// In production, do NOT disable TLS verification.
// If you truly need this (e.g. debugging a bad certificate chain), set `INSECURE_TLS=true`.
if (process.env.INSECURE_TLS === 'true' || process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log('🔹 initializing Supabase Client with URL:', SUPABASE_URL);

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase URL or Key in environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false
    }
});

export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

export const newSupabaseAdmin = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEW_SUPABASE_URL, process.env.NEW_SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

export const newSupabase = process.env.NEW_SUPABASE_URL && process.env.NEW_SUPABASE_KEY
    ? createClient(process.env.NEW_SUPABASE_URL, process.env.NEW_SUPABASE_KEY, {
        auth: {
            persistSession: false
        }
    })
    : null;

