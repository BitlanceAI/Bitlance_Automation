-- Add WordPress profile link to auto_blog_settings for automatic posting
ALTER TABLE auto_blog_settings
    ADD COLUMN IF NOT EXISTS wp_profile_id UUID REFERENCES wordpress_profiles(id) ON DELETE SET NULL;
