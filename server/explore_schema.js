import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log('Exploring Supabase public schema...');
    try {
        // Query pg_tables to get all tables in public schema
        const { data: tables, error: err } = await supabase
            .rpc('explore_schema_tables'); // Check if a helper RPC exists, or we run query
            
        if (err) {
            console.log('RPC not found, trying fallback list of known/suspected tables...');
            // Let's try querying standard tables to see which ones succeed and what columns they have.
            const candidateTables = [
                'user_workflows', 'agent_workflows', 'dograh_agents', 'workflows', 'agents',
                'user_settings', 'users', 'organizations', 'wallet', 'sales_calls',
                'active_calls', 'brand_contexts', 'workspaces', 'meta_connections'
            ];
            
            for (const table of candidateTables) {
                const { data, error } = await supabase.from(table).select('*').limit(1);
                if (!error) {
                    console.log(`✅ Table '${table}' exists! Columns:`, Object.keys(data[0] || {}));
                } else {
                    if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
                        console.log(`⚠️ Table '${table}' exists but failed:`, error.message);
                    }
                }
            }
        } else {
            console.log('Tables:', tables);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
main();
