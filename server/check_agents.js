import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log('Checking unique agent IDs and names in sales_calls...');
    try {
        const { data: calls, error } = await supabase
            .from('sales_calls')
            .select('agent_id, agent_name')
            .limit(100);
            
        if (error) throw error;
        
        const uniqueAgents = {};
        calls?.forEach(c => {
            if (c.agent_id) {
                uniqueAgents[c.agent_id] = c.agent_name || 'Unknown';
            }
        });
        
        console.log('Unique agents found in history:', uniqueAgents);
        
        // Let's also look up user itm.lotlite@gmail.com
        const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
        if (authErr) throw authErr;
        
        const user = authData.users.find(u => u.email === 'itm.lotlite@gmail.com');
        if (user) {
            console.log(`Found user itm.lotlite@gmail.com: ID=${user.id}`);
        } else {
            console.log('User itm.lotlite@gmail.com NOT found in auth.users.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}
main();
