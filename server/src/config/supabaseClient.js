// In production, do NOT disable TLS verification.
// If you truly need this (e.g. debugging a bad certificate chain), set `INSECURE_TLS=true`.
if (process.env.INSECURE_TLS === 'true' || process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
import { AsyncLocalStorage } from 'async_hooks';
global.WebSocket = ws;

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log('🔹 initializing Supabase Client with URL:', SUPABASE_URL);

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase URL or Key in environment variables');
}

// AsyncLocalStorage store to hold origin/referer context per request
export const supabaseStore = new AsyncLocalStorage();

// Static instances for the old database (Bitlance Automation)
export const oldSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false
    }
});

export const oldSupabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

// Static instances for the new database (Voice Dashboard / Lotlite redirect to central/old DB)
export const newSupabase = oldSupabase;
export const newSupabaseAdmin = oldSupabaseAdmin;

// Dynamic resolver
function getTargetClient(isAdmin = false) {
    return isAdmin ? oldSupabaseAdmin : oldSupabase;
}

// Proxies to route database operations dynamically based on request context
export const supabase = new Proxy({}, {
    get(target, prop) {
        const client = getTargetClient(false);
        const val = Reflect.get(client, prop);
        if (typeof val === 'function') {
            return val.bind(client);
        }
        return val;
    }
});

export const supabaseAdmin = new Proxy({}, {
    get(target, prop) {
        const client = getTargetClient(true);
        const val = Reflect.get(client, prop);
        if (typeof val === 'function') {
            return val.bind(client);
        }
        return val;
    }
});
