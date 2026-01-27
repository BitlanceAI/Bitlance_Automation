-- Migration to add comprehensive blog fields to articles table

-- 1. Add new columns
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS featured_image TEXT, -- Mapping 'featuredImage'
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Array of strings
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS author_photo TEXT,
ADD COLUMN IF NOT EXISTS author_bio TEXT,
ADD COLUMN IF NOT EXISTS publish_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estimated_read_time INTEGER, -- In minutes
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS internal_links TEXT[], -- Array of URLs
ADD COLUMN IF NOT EXISTS external_references TEXT[], -- Array of URLs
ADD COLUMN IF NOT EXISTS related_posts UUID[], -- Array of article IDs
ADD COLUMN IF NOT EXISTS social_share_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false; -- To manage draft/publish state explicitly

-- 2. Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- 3. Update existing records with defaults (Backward Compatibility)
-- Since 'title' might not exist in old schema (it was 'topic' or 'seo_title'), we check.
-- Checking current schema: 'topic', 'seo_title', 'content' exist.
-- We will use 'seo_title' or 'topic' as the basis for the slug.

UPDATE articles
SET 
  slug = lower(regexp_replace(coalesce(seo_title, topic), '[^a-zA-Z0-9]', '-', 'g')) || '-' || encode(gen_random_bytes(3), 'hex'),
  publish_date = created_at,
  author_name = 'AI Agent',
  estimated_read_time = CEIL(word_count::numeric / 200)
WHERE slug IS NULL;
