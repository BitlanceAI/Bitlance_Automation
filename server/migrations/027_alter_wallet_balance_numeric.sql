-- Alter wallet balance column type to NUMERIC(10, 2) to allow exact credit deductions
ALTER TABLE public.wallet ALTER COLUMN balance TYPE NUMERIC(10, 2);
