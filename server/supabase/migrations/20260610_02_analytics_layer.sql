CREATE TABLE IF NOT EXISTS public.api_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_name TEXT NOT NULL CHECK (plan_name IN ('Starter', 'Growth', 'Agency', 'Enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled')),
    monthly_quota INT NOT NULL DEFAULT 100,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    api_key_id UUID,
    endpoint TEXT NOT NULL,
    generation_type TEXT, -- SEO, GEO, Audit, Rewrite, Topic
    tokens_used INT DEFAULT 0,
    response_time_ms INT,
    status_code INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
    event_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all api subscriptions"
    ON public.api_subscriptions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage all api usage logs"
    ON public.api_usage_logs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage all api billing events"
    ON public.api_billing_events FOR ALL USING (true) WITH CHECK (true);
