-- Migration: Add delay_minutes to auto_blog_settings for dynamic scheduling
-- Run this in Supabase SQL Editor or via migration tool

ALTER TABLE auto_blog_settings 
  ADD COLUMN IF NOT EXISTS delay_minutes INTEGER NOT NULL DEFAULT 300;

-- Update existing row to have 300 minutes (5 hours) default
UPDATE auto_blog_settings SET delay_minutes = 300 WHERE delay_minutes IS NULL;

COMMENT ON COLUMN auto_blog_settings.delay_minutes IS 'Delay in minutes between each auto blog generation. Default 300 = 5 hours.';
