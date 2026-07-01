import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;

const db = createClient(
    'https://vtnpmdzxifcknrcrdevy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnBtZHp4aWZja25yY3JkZXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM1NzM1OSwiZXhwIjoyMDk3OTMzMzU5fQ.Zo-Ep_9HLWNeIFdfUNH_d5p7hngP4TU27XvVQNkgLBo'
);

async function checkCallOwnership() {
    console.log('Querying call ownership for 553067...');
    const { data: callData, error } = await db
        .from('sales_calls')
        .select('*')
        .eq('call_id', '553067');
    
    if (error) {
        console.error('Error fetching sales_call:', error.message);
        return;
    }
    console.log('sales_call for 553067:', JSON.stringify(callData, null, 2));

    if (callData && callData.length > 0) {
        const orgId = callData[0].organization_id;
        console.log('Organization ID:', orgId);
        
        // Fetch organization details
        const { data: orgData, error: orgErr } = await db
            .from('organizations')
            .select('*')
            .eq('id', orgId);
        
        if (orgErr) {
            console.error('Error fetching org:', orgErr.message);
        } else {
            console.log('Organization:', JSON.stringify(orgData, null, 2));
        }
    }
}

checkCallOwnership();
