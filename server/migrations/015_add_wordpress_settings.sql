-- Add WordPress credentials columns to user_settings table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS wp_url TEXT,
ADD COLUMN IF NOT EXISTS wp_username TEXT,
ADD COLUMN IF NOT EXISTS wp_app_password TEXT; -- Encrypted using AES-256

COMMENT ON COLUMN user_settings.wp_url IS 'WordPress site URL (e.g. https://yoursite.com)';
COMMENT ON COLUMN user_settings.wp_username IS 'WordPress username';
COMMENT ON COLUMN user_settings.wp_app_password IS 'WordPress Application Password (encrypted)';
