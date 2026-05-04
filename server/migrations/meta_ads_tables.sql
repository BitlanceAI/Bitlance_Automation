-- Meta Ads Automation Tables Migration
-- Run this in Supabase SQL Editor

-- =====================================================
-- Table: meta_connections
-- Stores user's Meta account connections
-- =====================================================
CREATE TABLE IF NOT EXISTS public.meta_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('oauth', 'api_key')),
    access_token TEXT NOT NULL, -- Encrypted
    app_id TEXT,
    app_secret TEXT, -- Encrypted
    token_expires_at TIMESTAMPTZ,
    pages JSONB DEFAULT '[]'::jsonb,
    ad_accounts JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One connection per user for now
);

-- =====================================================
-- Table: scheduled_posts
-- Stores scheduled posts for Meta platforms
-- =====================================================
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meta_connection_id UUID NOT NULL REFERENCES public.meta_connections(id) ON DELETE CASCADE,
    page_id TEXT NOT NULL,
    page_name TEXT,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb,
    link_url TEXT,
    scheduled_time TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled')),
    meta_post_id TEXT,
    error_message TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Table: meta_campaigns (for tracking/caching)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.meta_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meta_connection_id UUID NOT NULL REFERENCES public.meta_connections(id) ON DELETE CASCADE,
    campaign_id TEXT NOT NULL,
    ad_account_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT,
    objective TEXT,
    budget_remaining NUMERIC,
    daily_budget NUMERIC,
    lifetime_budget NUMERIC,
    insights JSONB DEFAULT '{}'::jsonb, -- Cached insights
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meta_connection_id, campaign_id)
);

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_meta_connections_user_id ON public.meta_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON public.scheduled_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_meta_campaigns_user_id ON public.meta_campaigns(user_id);

-- =====================================================
-- RLS Policies
-- =====================================================
ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_campaigns ENABLE ROW LEVEL SECURITY;

-- meta_connections policies
CREATE POLICY "Users can view own meta connections"
    ON public.meta_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meta connections"
    ON public.meta_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meta connections"
    ON public.meta_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meta connections"
    ON public.meta_connections FOR DELETE
    USING (auth.uid() = user_id);

-- scheduled_posts policies
CREATE POLICY "Users can view own scheduled posts"
    ON public.scheduled_posts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled posts"
    ON public.scheduled_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled posts"
    ON public.scheduled_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled posts"
    ON public.scheduled_posts FOR DELETE
    USING (auth.uid() = user_id);

-- meta_campaigns policies
CREATE POLICY "Users can view own meta campaigns"
    ON public.meta_campaigns FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meta campaigns"
    ON public.meta_campaigns FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- Updated_at trigger function
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_meta_connections_updated_at ON public.meta_connections;
CREATE TRIGGER update_meta_connections_updated_at
    BEFORE UPDATE ON public.meta_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_posts_updated_at ON public.scheduled_posts;
CREATE TRIGGER update_scheduled_posts_updated_at
    BEFORE UPDATE ON public.scheduled_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meta_campaigns_updated_at ON public.meta_campaigns;
CREATE TRIGGER update_meta_campaigns_updated_at
    BEFORE UPDATE ON public.meta_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Grant access to service role
-- =====================================================
GRANT ALL ON public.meta_connections TO service_role;
GRANT ALL ON public.scheduled_posts TO service_role;
GRANT ALL ON public.meta_campaigns TO service_role;

COMMENT ON TABLE public.meta_connections IS 'Stores Meta (Facebook/Instagram) account connections with encrypted tokens';
COMMENT ON TABLE public.scheduled_posts IS 'Stores scheduled posts for Meta platforms';
COMMENT ON TABLE public.meta_campaigns IS 'Cached Meta ad campaigns data';
