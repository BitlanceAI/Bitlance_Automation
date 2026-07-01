import { newSupabaseAdmin } from '../src/config/supabaseClient.js';

async function getConstraints() {
    const { data, error } = await newSupabaseAdmin.rpc('exec_sql', {
        sql: `
            SELECT 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                cc.check_clause
            FROM 
                information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.check_constraints cc
                    ON tc.constraint_name = cc.constraint_name
            WHERE 
                tc.table_name = 'call_analytics';
        `
    });
    if (error) {
        console.error('exec_sql not found or failed, trying postgrest view...');
        // If exec_sql doesn't work, we can search via a direct query if possible, 
        // or query the pg_catalog or similar. Let's try to query the REST endpoint
        console.log(error.message);
    } else {
        console.log('Constraints:', data);
    }
}

getConstraints();
