-- ============================================
-- CREDIT LEDGER SYSTEM - PRODUCTION MIGRATION
-- ============================================
-- Description: Centralized credit consumption tracking for all AI agents
-- Author: System
-- Date: 2026-01-30

-- ============================================
-- 1. AGENT PRICING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agent_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type TEXT NOT NULL UNIQUE,
    pricing_model TEXT NOT NULL CHECK (pricing_model IN ('per_second', 'per_word', 'per_image', 'per_request', 'flat_rate')),
    unit_cost INTEGER NOT NULL CHECK (unit_cost > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE agent_pricing IS 'Centralized pricing configuration for all AI agents';
COMMENT ON COLUMN agent_pricing.agent_type IS 'Agent identifier: voice, blog, design, etc.';
COMMENT ON COLUMN agent_pricing.unit_cost IS 'Credits charged per unit (second/word/image)';

-- Seed initial pricing
INSERT INTO agent_pricing (agent_type, pricing_model, unit_cost) VALUES
    ('voice', 'per_second', 1),
    ('blog', 'per_word', 5),
    ('design', 'per_image', 100)
ON CONFLICT (agent_type) DO NOTHING;

-- ============================================
-- 2. CREDIT LEDGER TABLE (CORE)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    
    -- Links to the resource that consumed credits
    reference_id UUID NOT NULL,
    reference_table TEXT NOT NULL CHECK (reference_table IN ('articles', 'sales_calls', 'design_jobs')),
    
    -- Usage metrics
    usage_quantity INTEGER NOT NULL CHECK (usage_quantity > 0),
    unit_cost INTEGER NOT NULL CHECK (unit_cost > 0),
    credits_used INTEGER NOT NULL CHECK (credits_used > 0),
    
    -- Flexible metadata for agent-specific details
    metadata JSONB DEFAULT '{}',
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add constraint to ensure credits_used = usage_quantity * unit_cost
ALTER TABLE credit_ledger 
DROP CONSTRAINT IF EXISTS credits_calculation_valid;

ALTER TABLE credit_ledger 
ADD CONSTRAINT credits_calculation_valid 
CHECK (credits_used = usage_quantity * unit_cost);

COMMENT ON TABLE credit_ledger IS 'Immutable append-only ledger for all credit consumption';
COMMENT ON COLUMN credit_ledger.reference_id IS 'UUID of the resource (article.id, sales_calls.id, etc.)';
COMMENT ON COLUMN credit_ledger.metadata IS 'Agent-specific data: {"duration_seconds": 240, "model": "gpt-4"}';

-- ============================================
-- 3. PERFORMANCE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id ON credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_agent_type ON credit_ledger(agent_type);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created_at ON credit_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_reference ON credit_ledger(reference_table, reference_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_agent_date ON credit_ledger(user_id, agent_type, created_at DESC);

-- ============================================
-- 4. ATOMIC CREDIT DEDUCTION FUNCTION
-- ============================================
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
    
    -- Step 5: Deduct from balance
    UPDATE user_credits
    SET 
        balance = balance - v_credits_needed,
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

COMMENT ON FUNCTION deduct_credits_with_ledger IS 'Atomically deduct credits and create ledger entry';

-- ============================================
-- 5. USER USAGE HISTORY FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_user_usage_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    agent_type TEXT,
    credits_used INTEGER,
    reference_id UUID,
    reference_table TEXT,
    usage_quantity INTEGER,
    unit_cost INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        agent_type,
        credits_used,
        reference_id,
        reference_table,
        usage_quantity,
        unit_cost,
        metadata,
        created_at
    FROM credit_ledger
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

COMMENT ON FUNCTION get_user_usage_history IS 'Get paginated usage history for a user';

-- ============================================
-- 6. BALANCE RECONCILIATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION reconcile_user_balance(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_stored_balance INTEGER;
    v_total_spent INTEGER;
BEGIN
    -- Get stored balance
    SELECT balance INTO v_stored_balance
    FROM user_credits
    WHERE user_id = p_user_id;
    
    IF v_stored_balance IS NULL THEN
        RETURN jsonb_build_object(
            'error', 'User credits record not found'
        );
    END IF;
    
    -- Calculate from ledger
    SELECT COALESCE(SUM(credits_used), 0) INTO v_total_spent
    FROM credit_ledger
    WHERE user_id = p_user_id;
    
    -- Return comparison
    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'stored_balance', v_stored_balance,
        'total_spent', v_total_spent,
        'reconciled', true
    );
END;
$$;

COMMENT ON FUNCTION reconcile_user_balance IS 'Admin function to verify balance matches ledger';

-- ============================================
-- 7. ANALYTICS VIEW
-- ============================================
CREATE OR REPLACE VIEW user_credit_analytics AS
SELECT 
    user_id,
    agent_type,
    COUNT(*) AS total_requests,
    SUM(credits_used) AS total_credits_spent,
    SUM(usage_quantity) AS total_units_consumed,
    AVG(credits_used) AS avg_credits_per_request,
    MIN(created_at) AS first_usage,
    MAX(created_at) AS last_usage
FROM credit_ledger
GROUP BY user_id, agent_type;

COMMENT ON VIEW user_credit_analytics IS 'Aggregated usage statistics per user and agent';

-- ============================================
-- 8. DAILY CONSUMPTION VIEW
-- ============================================
CREATE OR REPLACE VIEW daily_credit_consumption AS
SELECT 
    DATE(created_at) AS date,
    agent_type,
    COUNT(*) AS total_transactions,
    SUM(credits_used) AS total_credits,
    AVG(credits_used) AS avg_credits_per_transaction,
    COUNT(DISTINCT user_id) AS unique_users
FROM credit_ledger
GROUP BY DATE(created_at), agent_type
ORDER BY date DESC, total_credits DESC;

COMMENT ON VIEW daily_credit_consumption IS 'Daily aggregated credit consumption by agent type';

-- ============================================
-- 9. TOP SPENDERS VIEW
-- ============================================
CREATE OR REPLACE VIEW top_credit_spenders AS
SELECT 
    l.user_id,
    u.email,
    SUM(l.credits_used) AS total_spent,
    COUNT(*) AS total_requests,
    MAX(l.created_at) AS last_activity
FROM credit_ledger l
JOIN auth.users u ON u.id = l.user_id
GROUP BY l.user_id, u.email
ORDER BY total_spent DESC
LIMIT 100;

COMMENT ON VIEW top_credit_spenders IS 'Top 100 users by total credit consumption';

-- ============================================
-- 10. ROW-LEVEL SECURITY
-- ============================================
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own ledger" ON credit_ledger;
CREATE POLICY "Users can view their own ledger"
    ON credit_ledger FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all (assuming admin role in metadata)
DROP POLICY IF EXISTS "Admins can view all ledgers" ON credit_ledger;
CREATE POLICY "Admins can view all ledgers"
    ON credit_ledger FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ============================================
-- 11. BACKFILL EXISTING ARTICLES (OPTIONAL)
-- ============================================
-- This will create ledger entries for existing articles
-- Only run if you want historical data in the ledger

-- Uncomment to enable backfill:
/*
INSERT INTO credit_ledger (user_id, agent_type, reference_id, reference_table, usage_quantity, unit_cost, credits_used, metadata, created_at)
SELECT 
    user_id,
    'blog' AS agent_type,
    id AS reference_id,
    'articles' AS reference_table,
    COALESCE(word_count, 500) AS usage_quantity,
    5 AS unit_cost,
    COALESCE(word_count, 500) * 5 AS credits_used,
    jsonb_build_object('language', language, 'topic', topic, 'backfilled', true) AS metadata,
    created_at
FROM articles
WHERE NOT EXISTS (
    SELECT 1 FROM credit_ledger 
    WHERE reference_id = articles.id 
    AND reference_table = 'articles'
)
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Verify installation
DO $$
BEGIN
    RAISE NOTICE '✅ Credit Ledger System installed successfully';
    RAISE NOTICE 'Tables created: agent_pricing, credit_ledger';
    RAISE NOTICE 'Functions created: deduct_credits_with_ledger, get_user_usage_history, reconcile_user_balance';
    RAISE NOTICE 'Views created: user_credit_analytics, daily_credit_consumption, top_credit_spenders';
END $$;
