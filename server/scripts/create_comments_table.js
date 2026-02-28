// scripts/create_comments_table.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Creating comments table...');

    // We'll execute raw SQL to create the table and enable RLS
    const sql = `
    CREATE TABLE IF NOT EXISTS public.comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      article_id UUID NOT NULL REFERENCES public.company_articles(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      text TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Enable RLS
    ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON public.comments FOR SELECT USING (true);
    CREATE POLICY "Enable insert access for all users" ON public.comments FOR INSERT WITH CHECK (true);
  `;

    // Try via RPC if available, otherwise we use the standard REST API to see if the table already exists
    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
        if (error && !error.message.includes('function "exec_sql" does not exist')) {
            console.error('RPC Error:', error);
        } else if (error && error.message.includes('function "exec_sql" does not exist')) {
            console.log('No exec_sql RPC available. As an alternative, we will create the table directly through the dashboard or rely on frontend API.');
            // We can fallback to inserting a dummy row to a dummy table just to verify connection.
        } else {
            console.log('Success creating table via RPC!', data);
        }
    } catch (e) {
        console.error('Caught error execute SQL', e);
    }

    // Fallback: If exec_sql doesn't exist, we will just instruct the user to run the SQL in their Supabase dashboard.
    console.log('SQL command to run in Supabase SQL Editor if table creation failed:');
    console.log(sql);
}

run();
