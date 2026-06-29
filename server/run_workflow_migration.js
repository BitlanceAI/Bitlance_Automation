import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log('Running user_workflows migration and seeding via exec_sql RPC...');

    const createTableSql = `
    CREATE TABLE IF NOT EXISTS public.user_workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        workflow_id TEXT NOT NULL,
        workflow_name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        UNIQUE(user_id, workflow_id)
    );

    -- Index for fast lookups
    CREATE INDEX IF NOT EXISTS idx_user_workflows_user_id ON public.user_workflows(user_id);

    -- Enable RLS
    ALTER TABLE public.user_workflows ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Users can view own workflows" ON public.user_workflows;
    DROP POLICY IF EXISTS "Users can modify own workflows" ON public.user_workflows;

    -- Create open policies
    CREATE POLICY "Users can view own workflows" ON public.user_workflows FOR SELECT USING (true);
    CREATE POLICY "Users can modify own workflows" ON public.user_workflows FOR ALL USING (true);
    `;

    try {
        // 1. Create table
        const { data: createData, error: createErr } = await supabase.rpc('exec_sql', { sql_string: createTableSql });
        if (createErr) {
            console.error('Error creating table:', createErr.message);
        } else {
            console.log('Successfully created/verified user_workflows table!');
        }

        // 2. Look up the users
        const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
        if (authErr) throw authErr;

        const itmUser = authData.users.find(u => u.email === 'itm.lotlite@gmail.com');
        const sashankUser = authData.users.find(u => u.email === 'sashanksingh12205@gmail.com');

        if (itmUser) {
            console.log(`Seeding workflows for itm.lotlite@gmail.com (ID: ${itmUser.id})...`);
            
            // Insert 0ae47ce1-5ada-411c-85ff-e28105a374e6 (Lotlite)
            const { error: err1 } = await supabase.from('user_workflows').upsert({
                user_id: itmUser.id,
                workflow_id: '0ae47ce1-5ada-411c-85ff-e28105a374e6',
                workflow_name: 'Lotlite'
            }, { onConflict: 'user_id,workflow_id' });
            
            if (err1) console.error('Error inserting lotlite workflow:', err1.message);

            // Insert Real Estate- Outbound
            // Note: using 7ef7deb5-7e2d-4616-8ea5-93914314bccf (existing active outbound workflow ID)
            const { error: err2 } = await supabase.from('user_workflows').upsert({
                user_id: itmUser.id,
                workflow_id: '7ef7deb5-7e2d-4616-8ea5-93914314bccf',
                workflow_name: 'Real Estate- Outbound'
            }, { onConflict: 'user_id,workflow_id' });
            
            if (err2) console.error('Error inserting real estate outbound workflow:', err2.message);
        } else {
            console.warn('itm.lotlite@gmail.com user not found in auth.users.');
        }

        if (sashankUser) {
            console.log(`Seeding workflows for sashanksingh12205@gmail.com (ID: ${sashankUser.id})...`);
            
            const { error: err1 } = await supabase.from('user_workflows').upsert({
                user_id: sashankUser.id,
                workflow_id: '45b42390-369b-49b5-9a26-21a099dc843e',
                workflow_name: 'Property Buyer Lead Call'
            }, { onConflict: 'user_id,workflow_id' });
            
            if (err1) console.error('Error inserting property buyer workflow:', err1.message);

            const { error: err2 } = await supabase.from('user_workflows').upsert({
                user_id: sashankUser.id,
                workflow_id: '7ef7deb5-7e2d-4616-8ea5-93914314bccf',
                workflow_name: 'Seller Followup Call'
            }, { onConflict: 'user_id,workflow_id' });
            
            if (err2) console.error('Error inserting seller followup workflow:', err2.message);
        }

        console.log('Seeding completed successfully!');

    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}
main();
