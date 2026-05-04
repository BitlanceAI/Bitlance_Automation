-- Add interlink_urls field to auto_blogs queue entries
ALTER TABLE auto_blogs
    ADD COLUMN IF NOT EXISTS interlink_urls TEXT DEFAULT '';
