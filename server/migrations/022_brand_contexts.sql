-- Migration: 022_brand_contexts
-- Description: Creates a table to store dynamic brand knowledge contexts for AI generation.

CREATE TABLE IF NOT EXISTS public.brand_contexts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    services TEXT NOT NULL,
    products TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    industries TEXT NOT NULL,
    usp TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.brand_contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand contexts"
    ON public.brand_contexts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand contexts"
    ON public.brand_contexts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand contexts"
    ON public.brand_contexts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand contexts"
    ON public.brand_contexts FOR DELETE
    USING (auth.uid() = user_id);

-- Insert default Bitlance Automation context
-- Note: Assuming the first admin or a service role will claim this, we leave user_id null for global default or you can assign it via UI later.
-- For now we just create the schema.
