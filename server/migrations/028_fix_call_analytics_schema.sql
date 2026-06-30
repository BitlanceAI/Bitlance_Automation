-- Migration: 028_fix_call_analytics_schema.sql
-- Fix call_analytics table schema to match frontend and backend code expectations

-- 1. Drop the incorrect check constraint on call_outcome
ALTER TABLE public.call_analytics DROP CONSTRAINT IF EXISTS call_analytics_call_outcome_check;

-- 2. Convert customer_emotion from text[] to TEXT
ALTER TABLE public.call_analytics ALTER COLUMN customer_emotion TYPE TEXT USING COALESCE(customer_emotion[1], 'Neutral');

-- 3. Convert objections and complaints from text[] to JSONB
ALTER TABLE public.call_analytics ALTER COLUMN objections TYPE JSONB USING array_to_json(objections)::jsonb;
ALTER TABLE public.call_analytics ALTER COLUMN complaints TYPE JSONB USING array_to_json(complaints)::jsonb;
