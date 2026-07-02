import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEW_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const newDb = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Run the migration SQL in the new database using pg REST
// We'll use individual CREATE TABLE statements via rpc if available,
// or via the management API
const migration = `
-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    admin_id UUID,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. WALLET
CREATE TABLE IF NOT EXISTS public.wallet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    balance INTEGER DEFAULT 0 NOT NULL CHECK (balance >= 0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. SALES_CALLS
CREATE TABLE IF NOT EXISTS public.sales_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_number TEXT,
    agent_id TEXT,
    agent_name TEXT,
    duration INTEGER DEFAULT 0,
    credits_used NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT NOT NULL,
    recording_url TEXT,
    transcript TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallet(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    description TEXT,
    reference_id UUID,
    reference_table TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. ACTIVE_CALLS
CREATE TABLE IF NOT EXISTS public.active_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_number TEXT,
    agent_id TEXT,
    agent_name TEXT,
    started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. CALL_ANALYTICS (for AI analysis results)
CREATE TABLE IF NOT EXISTS public.call_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id TEXT UNIQUE,
    overall_sentiment TEXT,
    sentiment_score INTEGER,
    confidence INTEGER,
    customer_emotion TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    interest_level TEXT,
    buying_intent TEXT,
    call_outcome TEXT,
    customer_satisfaction TEXT,
    objections JSONB DEFAULT '[]',
    complaints JSONB DEFAULT '[]',
    key_topics JSONB DEFAULT '[]',
    positive_signals JSONB DEFAULT '[]',
    negative_signals JSONB DEFAULT '[]',
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sales_calls_call_id ON public.sales_calls(call_id);
CREATE INDEX IF NOT EXISTS idx_sales_calls_org_id ON public.sales_calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON public.transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_active_calls_call_id ON public.active_calls(call_id);
`;

async function runMigration() {
    console.log('🚀 Running voice billing tables migration on NEW Supabase DB...\n');
    
    // Split into individual statements and run each
    const statements = migration
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 10 && !s.startsWith('--'));
    
    let success = 0;
    let failed = 0;
    
    for (const stmt of statements) {
        try {
            const { error } = await newDb.rpc('exec_sql', { sql: stmt + ';' });
            if (error) {
                // Try direct query approach
                const { error: err2 } = await newDb.from('_migrations').select('*').limit(0);
                console.warn(`⚠️  RPC not available, trying direct approach...`);
                break;
            }
            success++;
        } catch (e) {
            console.warn('RPC exec_sql not available:', e.message);
            break;
        }
    }
    
    if (success === 0) {
        // exec_sql not available - use fetch to Supabase SQL endpoint
        console.log('ℹ️  Using Supabase SQL HTTP endpoint directly...\n');
        
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                },
                body: JSON.stringify({ sql: migration })
            });
            
            const text = await response.text();
            
            if (!response.ok) {
                console.error('❌ SQL endpoint failed:', text);
                console.log('\n⚠️  Please run the migration manually in your Supabase SQL Editor:');
                console.log('URL:', supabaseUrl.replace('https://', '').replace('.supabase.co', ''));
                console.log('Go to: https://supabase.com/dashboard → SQL Editor → paste migrations/025_voice_billing_tables.sql\n');
            } else {
                console.log('✅ Migration ran successfully via SQL endpoint!');
            }
        } catch (fetchErr) {
            console.error('❌ Fetch error:', fetchErr.message);
        }
    }
    
    // Verify tables now exist
    console.log('\n🔍 Verifying tables after migration...\n');
    const tables = ['organizations', 'wallet', 'sales_calls', 'active_calls', 'transactions', 'call_analytics'];
    for (const table of tables) {
        const { error } = await newDb.from(table).select('id').limit(0);
        if (error) {
            console.error(`❌ ${table}: ${error.message}`);
            failed++;
        } else {
            console.log(`✅ ${table}: OK`);
            success++;
        }
    }
    
    if (failed > 0) {
        console.log('\n⚠️  Some tables are missing! Please run this SQL manually in Supabase Dashboard:');
        console.log(`\nProject URL: ${supabaseUrl}`);
        console.log('→ Go to Supabase Dashboard → SQL Editor → Paste contents of:');
        console.log('  /home/codebloodedsash/automation bitlance/Bitlance_Automation/server/migrations/025_voice_billing_tables.sql\n');
    }
    
    process.exit(failed > 0 ? 1 : 0);
}

runMigration();
