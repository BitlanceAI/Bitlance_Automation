-- Migration: Meta Ads Platform Core Tables
-- Creates tables for campaigns, leads, conversions, and webhook logs

-- =============================================
-- CAMPAIGNS TABLE (Unified)
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Meta IDs
    meta_campaign_id TEXT,
    meta_adset_id TEXT,
    meta_ad_id TEXT,
    meta_pixel_id TEXT,
    
    -- Campaign Details
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEAD_GENERATION', 'SALES', 'APP_PROMOTION', 'LOCAL_BUSINESS', 'REMARKETING', 'OFFER_EVENT')),
    objective TEXT,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PAUSED', 'ACTIVE', 'COMPLETED', 'ERROR')),
    
    -- Budget & Schedule
    budget_daily NUMERIC(10, 2),
    budget_lifetime NUMERIC(10, 2),
    currency TEXT DEFAULT 'USD',
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    
    -- Configuration
    raw_config JSONB,
    targeting JSONB,
    creative JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns" ON public.campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON public.campaigns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- LEADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    
    -- Meta Lead IDs
    meta_leadgen_id TEXT UNIQUE,
    meta_form_id TEXT,
    meta_page_id TEXT,
    meta_ad_id TEXT,
    
    -- Lead Data (populated after fetching from Graph API)
    email TEXT,
    phone TEXT,
    full_name TEXT,
    field_data JSONB,
    
    -- Status
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED')),
    
    -- Timestamps
    created_time TIMESTAMPTZ,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- CONVERSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    
    -- Event Details
    event_name TEXT NOT NULL,
    event_time BIGINT,
    event_id TEXT,
    
    -- User Data (hashed)
    user_data JSONB,
    custom_data JSONB,
    
    -- Attribution
    source_url TEXT,
    action_source TEXT DEFAULT 'website',
    
    -- Raw
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRACKING EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    event_name TEXT NOT NULL,
    event_time BIGINT,
    event_id TEXT,
    
    user_data JSONB,
    custom_data JSONB,
    source_url TEXT,
    action_source TEXT DEFAULT 'website',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- META WEBHOOK LOGS (for debugging)
-- =============================================
CREATE TABLE IF NOT EXISTS public.meta_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT,
    payload JSONB,
    received_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Add updated_at trigger function
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to campaigns
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to leads
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
