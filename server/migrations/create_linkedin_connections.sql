-- Migration: Create linkedin_connections table

CREATE TABLE IF NOT EXISTS public.linkedin_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    access_token TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    profile_name TEXT NOT NULL,
    profile_picture TEXT,
    email TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Ensure a user can only have one active connection per linkedin profile (so we don't spam multiple entries of the same account)
CREATE UNIQUE INDEX IF NOT EXISTS idx_linkedin_connections_user_profile ON public.linkedin_connections (user_id, profile_id);

-- Optional: Add Row Level Security (RLS) policies if the client queries this directly
ALTER TABLE public.linkedin_connections ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'linkedin_connections' 
    AND policyname = 'Users can view their own linkedin connections'
  ) THEN
    CREATE POLICY "Users can view their own linkedin connections"
        ON public.linkedin_connections
        FOR SELECT
        USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add updated_at trigger (creates the function if it doesn't exist, handles updates)
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_linkedin_connections_updated_at'
  ) THEN
    CREATE TRIGGER update_linkedin_connections_updated_at
    BEFORE UPDATE ON public.linkedin_connections
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
