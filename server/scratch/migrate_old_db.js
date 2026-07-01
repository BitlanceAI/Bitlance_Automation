import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;
import dotenv from 'dotenv';
dotenv.config();

const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const migrationSql = `
-- Create call_analytics table
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
    objections JSONB DEFAULT '[]'::jsonb,
    complaints JSONB DEFAULT '[]'::jsonb,
    key_topics JSONB DEFAULT '[]'::jsonb,
    positive_signals JSONB DEFAULT '[]'::jsonb,
    negative_signals JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create lotlite_leads table
CREATE TABLE IF NOT EXISTS public.lotlite_leads (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    call_id TEXT,
    workflow_id TEXT,
    workflow_name TEXT,
    campaign_id TEXT,
    call_time TIMESTAMPTZ,
    duration_seconds TEXT,
    phone_number TEXT,
    first_name TEXT,
    preferred_language TEXT,
    purpose TEXT,
    full_name TEXT,
    mobile_number TEXT,
    email TEXT,
    property_type TEXT,
    city TEXT,
    locality TEXT,
    budget TEXT,
    size_bhk TEXT,
    amenities TEXT,
    move_in_timeline TEXT,
    recording_url TEXT,
    user_recording_url TEXT,
    bot_recording_url TEXT,
    transcript_url TEXT
);
`;

async function run() {
    console.log("Running migration SQL on the OLD database via HTTP endpoint...");
    try {
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ sql: migrationSql })
        });
        
        const text = await response.text();
        
        if (!response.ok) {
            console.error('❌ SQL endpoint failed on old DB:', text);
            console.log("Please create these two tables (call_analytics and lotlite_leads) manually in your Supabase dashboard SQL editor for the OLD database.");
        } else {
            console.log('✅ Tables created successfully in the old DB!');
        }
    } catch (err) {
        console.error('❌ Request error:', err.message);
    }
}
run();
