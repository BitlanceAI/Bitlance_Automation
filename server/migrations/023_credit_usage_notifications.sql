-- Migration: Add credit usage notification fields to user_credits
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS total_credits INTEGER DEFAULT 500;
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS used_credits INTEGER DEFAULT 0;
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS email_50_sent BOOLEAN DEFAULT false;
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS email_75_sent BOOLEAN DEFAULT false;
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS email_90_sent BOOLEAN DEFAULT false;
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS email_100_sent BOOLEAN DEFAULT false;

-- Backfill total_credits and used_credits based on balance + history
-- Since balance = total_credits - used_credits:
-- We set used_credits to the sum of credits used from the ledger,
-- and total_credits to balance + used_credits (at least 500).
UPDATE public.user_credits uc
SET 
  used_credits = COALESCE((
    SELECT SUM(credits_used) 
    FROM public.credit_ledger 
    WHERE user_id = uc.user_id
  ), 0),
  total_credits = GREATEST(500, balance + COALESCE((
    SELECT SUM(credits_used) 
    FROM public.credit_ledger 
    WHERE user_id = uc.user_id
  ), 0));

-- Update handle_new_user_credits trigger function to initialize these columns
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance, total_credits, used_credits)
  VALUES (new.id, 500, 500, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update deduct_credits_with_ledger to increment used_credits atomically
CREATE OR REPLACE FUNCTION deduct_credits_with_ledger(
    p_user_id UUID,
    p_agent_type TEXT,
    p_reference_id UUID,
    p_reference_table TEXT,
    p_usage_quantity INTEGER,
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_unit_cost INTEGER;
    v_credits_needed INTEGER;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_ledger_id UUID;
BEGIN
    -- Step 1: Get pricing (with lock to prevent concurrent price changes)
    SELECT unit_cost INTO v_unit_cost
    FROM agent_pricing
    WHERE agent_type = p_agent_type AND is_active = true
    FOR UPDATE;
    
    IF v_unit_cost IS NULL THEN
        RAISE EXCEPTION 'No active pricing found for agent_type: %', p_agent_type;
    END IF;
    
    -- Override unit cost for blog agent types: Admin ID = 10, other users = 50
    IF p_agent_type IN ('blog', 'seo_blog', 'geo_blog', 'geo_blog_dashboard') THEN
        IF p_user_id = '0d396440-7d07-407c-89da-9cb93e353347' THEN
            v_unit_cost := 10;
        ELSE
            v_unit_cost := 50;
        END IF;
    END IF;

    -- Step 2: Calculate credits needed
    v_credits_needed := p_usage_quantity * v_unit_cost;
    
    -- Step 3: Lock user balance row (CRITICAL: prevents race conditions)
    SELECT balance INTO v_current_balance
    FROM user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'User credits record not found for user_id: %', p_user_id;
    END IF;
    
    -- Step 4: Check sufficient balance
    IF v_current_balance < v_credits_needed THEN
        RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', 
            v_credits_needed, v_current_balance
        USING ERRCODE = 'P0001';
    END IF;
    
    -- Step 5: Deduct from balance and update used_credits
    UPDATE user_credits
    SET 
        balance = balance - v_credits_needed,
        used_credits = used_credits + v_credits_needed,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    v_new_balance := v_current_balance - v_credits_needed;
    
    -- Step 6: Insert immutable ledger record
    INSERT INTO credit_ledger (
        user_id,
        agent_type,
        reference_id,
        reference_table,
        usage_quantity,
        unit_cost,
        credits_used,
        metadata
    ) VALUES (
        p_user_id,
        p_agent_type,
        p_reference_id,
        p_reference_table,
        p_usage_quantity,
        v_unit_cost,
        v_credits_needed,
        p_metadata
    )
    RETURNING id INTO v_ledger_id;
    
    -- Step 7: Return transaction summary
    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'credits_deducted', v_credits_needed,
        'previous_balance', v_current_balance,
        'new_balance', v_new_balance
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;
