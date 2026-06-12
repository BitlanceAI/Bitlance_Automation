-- Migration: Content Tracking and AI Visibility Layer
-- Description: Creates tables to monitor traditional SEO rankings and AI Engine citation share over time.

-- 1. Tracked Keywords / Articles
CREATE TABLE IF NOT EXISTS public.tracked_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_url TEXT NOT NULL,
    target_keyword TEXT NOT NULL,
    optimization_mode TEXT NOT NULL DEFAULT 'SEO', -- 'SEO' or 'GEO'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_checked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, article_url, target_keyword)
);

-- 2. Traditional SEO Rank Logs (Google SERP)
CREATE TABLE IF NOT EXISTS public.seo_rank_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracked_keyword_id UUID REFERENCES public.tracked_keywords(id) ON DELETE CASCADE,
    search_engine TEXT DEFAULT 'Google',
    position INTEGER, -- 1-100, or NULL if unranked
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0.00,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. GEO AI Visibility Logs (LLM Citations)
CREATE TABLE IF NOT EXISTS public.ai_citation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracked_keyword_id UUID REFERENCES public.tracked_keywords(id) ON DELETE CASCADE,
    ai_engine TEXT NOT NULL, -- 'Perplexity', 'ChatGPT', 'Gemini', 'Claude'
    was_cited BOOLEAN DEFAULT FALSE,
    citation_url_found TEXT, -- The exact URL the AI cited, if any
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.tracked_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_rank_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_citation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tracked keywords"
    ON public.tracked_keywords FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own seo logs"
    ON public.seo_rank_logs FOR SELECT 
    USING (tracked_keyword_id IN (SELECT id FROM public.tracked_keywords WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own ai citation logs"
    ON public.ai_citation_logs FOR SELECT 
    USING (tracked_keyword_id IN (SELECT id FROM public.tracked_keywords WHERE user_id = auth.uid()));
