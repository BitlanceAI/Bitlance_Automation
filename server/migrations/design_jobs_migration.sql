-- ============================================
-- DESIGN JOBS TABLE - MIGRATION
-- ============================================
-- Description: Table for storing graphic designer agent jobs (flyer generation)
-- Author: System
-- Date: 2026-01-31

-- ============================================
-- 1. CREATE DESIGN_JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS design_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Property Details
    property_type TEXT NOT NULL,
    location TEXT NOT NULL,
    price TEXT NOT NULL,
    builder TEXT NOT NULL,
    
    -- Contact Information
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    
    -- Generated Content
    flyer_url TEXT,
    background_url TEXT,
    
    -- Marketing Copy (stored for reference)
    title TEXT,
    subline TEXT,
    amenities JSONB DEFAULT '[]',
    cta TEXT,
    
    -- Job Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Credit Tracking
    credits_used INTEGER DEFAULT 100,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- 2. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_design_jobs_user_id ON design_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_design_jobs_status ON design_jobs(status);
CREATE INDEX IF NOT EXISTS idx_design_jobs_created_at ON design_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_design_jobs_user_status ON design_jobs(user_id, status, created_at DESC);

-- ============================================
-- 3. ROW-LEVEL SECURITY
-- ============================================
ALTER TABLE design_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own design jobs" ON design_jobs;
CREATE POLICY "Users can view their own design jobs"
    ON design_jobs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own design jobs" ON design_jobs;
CREATE POLICY "Users can insert their own design jobs"
    ON design_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own design jobs" ON design_jobs;
CREATE POLICY "Users can update their own design jobs"
    ON design_jobs FOR UPDATE
    USING (auth.uid() = user_id);

-- Admins can view all design jobs
DROP POLICY IF EXISTS "Admins can view all design jobs" ON design_jobs;
CREATE POLICY "Admins can view all design jobs"
    ON design_jobs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ============================================
-- 4. ADD DESIGN AGENT PRICING
-- ============================================
-- Add design agent to agent_pricing table if not exists
INSERT INTO agent_pricing (agent_type, pricing_model, unit_cost) 
VALUES ('design', 'per_image', 100)
ON CONFLICT (agent_type) DO UPDATE 
SET 
    pricing_model = EXCLUDED.pricing_model,
    unit_cost = EXCLUDED.unit_cost,
    is_active = true,
    updated_at = now();

-- ============================================
-- 5. UPDATE TRIGGER FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_design_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_design_jobs_updated_at ON design_jobs;
CREATE TRIGGER trigger_update_design_jobs_updated_at
    BEFORE UPDATE ON design_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_design_jobs_updated_at();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Design Jobs table created successfully';
    RAISE NOTICE 'Table: design_jobs';
    RAISE NOTICE 'Agent pricing added: design (100 credits per image)';
END $$;
