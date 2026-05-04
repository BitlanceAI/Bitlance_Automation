-- Add WhatsApp specific columns to meta_connections table
ALTER TABLE meta_connections 
ADD COLUMN IF NOT EXISTS whatsapp_phone_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS waba_id VARCHAR(255);

-- Check if RLS policy exists for updating meta_connections, if not create one
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meta_connections' 
        AND policyname = 'Users can update their own meta connection'
    ) THEN
        CREATE POLICY "Users can update their own meta connection"
        ON meta_connections
        FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
END
$$;
