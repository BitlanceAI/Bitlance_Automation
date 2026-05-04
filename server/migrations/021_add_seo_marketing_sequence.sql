-- Add 'seo_marketing' sequence type to email_sequences table
-- This allows bulk import of SEO leads and automated marketing email sequences

-- First, we need to drop the existing CHECK constraint and recreate it with the new value
ALTER TABLE email_sequences DROP CONSTRAINT email_sequences_sequence_type_check;

-- Add the new CHECK constraint that includes 'seo_marketing'
ALTER TABLE email_sequences
ADD CONSTRAINT email_sequences_sequence_type_check 
CHECK (sequence_type IN ('welcome', 'nurture', 'reengagement', 'seo_marketing'));

-- Create an index for faster lookups of SEO marketing sequences
CREATE INDEX IF NOT EXISTS idx_email_sequences_seo_marketing
    ON email_sequences (email)
    WHERE sequence_type = 'seo_marketing' AND completed = false AND unsubscribed = false;
