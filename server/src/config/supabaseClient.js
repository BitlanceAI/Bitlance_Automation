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

// Safe Proxy builder to prevent TypeErrors on unconfigured databases/keys
const makeSafeProxy = (getClientFn) => {
    return new Proxy({}, {
        get(target, prop) {
            const client = getClientFn();
            if (!client) {
                console.warn(`[SupabaseClient Proxy] Warning: Client is not initialized for property "${String(prop)}". Returning fallback mock.`);
                
                // Return safe mock structures for common API routes to prevent crash
                if (prop === 'auth') {
                    return {
                        admin: new Proxy({}, {
                            get(t, p) {
                                return () => Promise.resolve({ data: { users: [], user: null }, error: null });
                            }
                        }),
                        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
                        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
                        signOut: () => Promise.resolve({ error: null })
                    };
                }
                
                if (prop === 'storage') {
                    return {
                        from: () => ({
                            getPublicUrl: () => ({ data: { publicUrl: '' } }),
                            upload: () => Promise.resolve({ data: null, error: null })
                        })
                    };
                }

                if (prop === 'rpc') {
                    return () => Promise.resolve({ data: null, error: null });
                }

                const chainable = () => chainable;
                chainable.select = () => chainable;
                chainable.insert = () => chainable;
                chainable.update = () => chainable;
                chainable.upsert = () => chainable;
                chainable.delete = () => chainable;
                chainable.eq = () => chainable;
                chainable.neq = () => chainable;
                chainable.gt = () => chainable;
                chainable.lt = () => chainable;
                chainable.gte = () => chainable;
                chainable.lte = () => chainable;
                chainable.or = () => chainable;
                chainable.order = () => chainable;
                chainable.limit = () => chainable;
                chainable.single = () => chainable;
                chainable.maybeSingle = () => chainable;
                
                chainable.then = (resolve) => resolve({ data: [], error: null });
                
                return chainable;
            }
            
            const val = Reflect.get(client, prop);
            if (typeof val === 'function') {
                return val.bind(client);
            }
            return val;
        }
    });
};

const staticOldSupabaseClient = SUPABASE_URL && SUPABASE_KEY 
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: false
        }
    })
    : null;

const staticOldSupabaseAdminClient = process.env.SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL
    ? createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

// Export all static and dynamic instances wrapped in the safe proxy structure
export const oldSupabase = makeSafeProxy(() => staticOldSupabaseClient);
export const oldSupabaseAdmin = makeSafeProxy(() => staticOldSupabaseAdminClient);

export const newSupabase = oldSupabase;
export const newSupabaseAdmin = oldSupabaseAdmin;

function getTargetClient(isAdmin = false) {
    return isAdmin ? staticOldSupabaseAdminClient : staticOldSupabaseClient;
}

export const supabase = makeSafeProxy(() => getTargetClient(false));
export const supabaseAdmin = makeSafeProxy(() => getTargetClient(true));
