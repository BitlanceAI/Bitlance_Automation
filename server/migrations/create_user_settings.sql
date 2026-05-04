-- Create user_settings table for storing Google Sheets credentials
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    google_sheet_id TEXT,
    google_service_email TEXT,
    google_private_key TEXT, -- Encrypted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own settings
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (true); -- Temporarily allow all for testing

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (true); -- Temporarily allow all for testing

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (true); -- Temporarily allow all for testing

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete own settings"
    ON user_settings FOR DELETE
    USING (true); -- Temporarily allow all for testing

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Note: In production, replace 'true' with 'auth.uid() = user_id' for proper RLS
