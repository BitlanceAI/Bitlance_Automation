-- =========================================================================
-- SQL SCRIPT: setup_old_db_voice.sql
-- Run this script in the SQL EDITOR of your OLD/CENTRAL Supabase database.
-- =========================================================================

-- 1. Create call_analytics table
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

-- 2. Create lotlite_leads table
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

-- 3. Create sync_wallet_to_user_credits trigger function
CREATE OR REPLACE FUNCTION public.sync_wallet_to_user_credits()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- Prevent infinite recursion loops
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    SELECT admin_id INTO v_admin_id 
    FROM public.organizations 
    WHERE id = NEW.organization_id;

    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.user_credits (user_id, balance, updated_at)
        VALUES (v_admin_id, NEW.balance, now())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            balance = NEW.balance,
            updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_wallet_to_user_credits ON public.wallet;
CREATE TRIGGER trg_sync_wallet_to_user_credits
    AFTER INSERT OR UPDATE OF balance ON public.wallet
    FOR EACH ROW EXECUTE FUNCTION public.sync_wallet_to_user_credits();

-- 4. Create sync_user_credits_to_wallet trigger function
CREATE OR REPLACE FUNCTION public.sync_user_credits_to_wallet()
RETURNS TRIGGER AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Prevent infinite recursion loops
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    -- Find organization where this user is the admin
    SELECT id INTO v_org_id 
    FROM public.organizations 
    WHERE admin_id = NEW.user_id;

    IF v_org_id IS NOT NULL THEN
        INSERT INTO public.wallet (organization_id, balance, updated_at)
        VALUES (v_org_id, NEW.balance, now())
        ON CONFLICT (organization_id) 
        DO UPDATE SET 
            balance = NEW.balance,
            updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_user_credits_to_wallet ON public.user_credits;
CREATE TRIGGER trg_sync_user_credits_to_wallet
    AFTER UPDATE OF balance ON public.user_credits
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_credits_to_wallet();
