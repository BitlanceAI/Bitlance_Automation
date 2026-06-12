ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS optimization_mode text DEFAULT 'GEO';
ALTER TABLE public.company_articles ADD COLUMN IF NOT EXISTS optimization_mode text DEFAULT 'GEO';
