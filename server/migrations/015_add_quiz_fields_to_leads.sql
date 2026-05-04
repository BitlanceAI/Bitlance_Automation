-- Add quiz score and answers fields to leads table
-- Run in Supabase SQL Editor

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS quiz_score INTEGER,
  ADD COLUMN IF NOT EXISTS quiz_answers JSONB;
