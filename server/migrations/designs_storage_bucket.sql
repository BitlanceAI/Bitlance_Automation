-- Create storage bucket for design flyers
-- Run this in Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('designs', 'designs', true)
ON CONFLICT (id) DO NOTHING;

-- Set public access policy
CREATE POLICY "Public Access for designs bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'designs');

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can upload designs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'designs' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own designs
CREATE POLICY "Users can update own designs"
ON storage.objects FOR UPDATE
USING (auth.uid()::text = owner)
WITH CHECK (bucket_id = 'designs');

-- Allow users to delete their own designs
CREATE POLICY "Users can delete own designs"
ON storage.objects FOR DELETE
USING (auth.uid()::text = owner AND bucket_id = 'designs');
