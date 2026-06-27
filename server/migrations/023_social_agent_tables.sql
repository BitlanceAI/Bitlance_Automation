-- Migration: 023_social_agent_tables
-- Description: Creates tables for the AI Social Agent feature:
--   brand_configs, content_calendars, post_bundles, graphic_assets

-- =========================================================
-- 1. brand_configs – brand profiles for content generation
-- =========================================================
CREATE TABLE IF NOT EXISTS public.brand_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    brand_tone TEXT,
    brand_niche TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.brand_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on brand_configs"
    ON public.brand_configs FOR ALL
    USING (true)
    WITH CHECK (true);

-- =========================================================
-- 2. content_calendars – monthly content calendar strategies
-- =========================================================
CREATE TABLE IF NOT EXISTS public.content_calendars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    themes JSONB DEFAULT '[]'::jsonb,
    festivals JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.content_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on content_calendars"
    ON public.content_calendars FOR ALL
    USING (true)
    WITH CHECK (true);

-- =========================================================
-- 3. graphic_assets – uploaded or AI-generated image assets
-- =========================================================
CREATE TABLE IF NOT EXISTS public.graphic_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    file_url TEXT NOT NULL,
    asset_type TEXT DEFAULT 'image',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.graphic_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on graphic_assets"
    ON public.graphic_assets FOR ALL
    USING (true)
    WITH CHECK (true);

-- =========================================================
-- 4. post_bundles – AI-generated post drafts for review
-- =========================================================
CREATE TABLE IF NOT EXISTS public.post_bundles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending_review',
    generated_caption TEXT,
    generated_hashtags JSONB DEFAULT '[]'::jsonb,
    strategy_used JSONB,
    graphic_asset_id UUID REFERENCES public.graphic_assets(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.post_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on post_bundles"
    ON public.post_bundles FOR ALL
    USING (true)
    WITH CHECK (true);
