-- ========================================================
-- MIGRATION: 025_voice_billing_tables.sql
-- Description: Schema definitions for single-client billing dashboard
--              and voice agent integration.
-- ========================================================

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.organizations IS 'Firms or companies utilizing the billing system';

-- 2. WALLET TABLE
CREATE TABLE IF NOT EXISTS public.wallet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    balance INTEGER DEFAULT 0 NOT NULL CHECK (balance >= 0),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.wallet IS 'Credits wallet for each organization';

-- 3. SALES_CALLS HISTORY TABLE (Maps to credit_ledger check constraint)
CREATE TABLE IF NOT EXISTS public.sales_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id TEXT UNIQUE NOT NULL, -- Dograh / Retell call ID
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_number TEXT,
    agent_id TEXT,
    agent_name TEXT,
    duration INTEGER DEFAULT 0, -- in seconds
    credits_used NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT NOT NULL, -- active, completed, failed, busy, no-answer
    recording_url TEXT,
    transcript TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_calls_call_id ON public.sales_calls(call_id);
CREATE INDEX IF NOT EXISTS idx_sales_calls_organization_id ON public.sales_calls(organization_id);

-- 4. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES public.wallet(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL, -- Credits added (positive) or deducted (negative)
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    description TEXT,
    reference_id UUID, -- References payment_orders or sales_calls table
    reference_table TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON public.transactions(organization_id);

-- 5. PAYMENTS TABLE (Razorpay)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_id TEXT UNIQUE NOT NULL, -- Razorpay order_id
    payment_id TEXT, -- Razorpay payment_id
    amount NUMERIC(10, 2) NOT NULL, -- Actual INR amount paid
    gst NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- 6. ACTIVE CALLS (Real-time updates)
CREATE TABLE IF NOT EXISTS public.active_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_number TEXT,
    agent_id TEXT,
    agent_name TEXT,
    started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_active_calls_call_id ON public.active_calls(call_id);

-- ========================================================
-- WALLET AND USER_CREDITS BIDIRECTIONAL SYNC TRIGGERS
-- Ensures existing voice/blog agents and new wallet table stay synced.
-- ========================================================

-- Sync Wallet balance to User Credits (when wallet is updated)
CREATE OR REPLACE FUNCTION public.sync_wallet_to_user_credits()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- Prevent infinite recursion loop
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    SELECT admin_id INTO v_admin_id 
    FROM public.organizations 
    WHERE id = NEW.organization_id;

    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.user_credits (user_id, balance, updated_at)
        VALUES (v_admin_id, NEW.balance, now())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            balance = NEW.balance,
            updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_wallet_to_user_credits ON public.wallet;
CREATE TRIGGER trg_sync_wallet_to_user_credits
    AFTER INSERT OR UPDATE OF balance ON public.wallet
    FOR EACH ROW EXECUTE FUNCTION public.sync_wallet_to_user_credits();

-- Sync User Credits to Wallet (when user_credits is updated)
CREATE OR REPLACE FUNCTION public.sync_user_credits_to_wallet()
RETURNS TRIGGER AS $$
DECLARE
    v_org_id UUID;
BEGIN
    -- Prevent infinite recursion loop
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    -- Find organization where this user is the admin
    SELECT id INTO v_org_id 
    FROM public.organizations 
    WHERE admin_id = NEW.user_id;

    IF v_org_id IS NOT NULL THEN
        INSERT INTO public.wallet (organization_id, balance, updated_at)
        VALUES (v_org_id, NEW.balance, now())
        ON CONFLICT (organization_id) 
        DO UPDATE SET 
            balance = NEW.balance,
            updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_user_credits_to_wallet ON public.user_credits;
CREATE TRIGGER trg_sync_user_credits_to_wallet
    AFTER UPDATE OF balance ON public.user_credits
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_credits_to_wallet();
