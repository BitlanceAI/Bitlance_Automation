-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Awareness Campaigns
CREATE TABLE IF NOT EXISTS awareness_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) DEFAULT 'brand_awareness',
    status VARCHAR(50) DEFAULT 'draft',
    targeting_config JSONB,
    creative_assets JSONB,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    max_impressions_per_user INTEGER DEFAULT 3,
    max_impressions_per_day INTEGER,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES awareness_campaigns(id),
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    variant_id VARCHAR(100),
    placement VARCHAR(100),
    creative_type VARCHAR(50),
    was_viewable BOOLEAN DEFAULT FALSE,
    view_duration_ms INTEGER,
    viewport_percentage INTEGER,
    page_url TEXT,
    referrer TEXT,
    device_type VARCHAR(50),
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_impressions_campaign_user ON campaign_impressions(campaign_id, user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_impressions_timestamp ON campaign_impressions(timestamp);

-- 2. Traffic Campaigns
CREATE TABLE IF NOT EXISTS traffic_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) DEFAULT 'traffic',
    status VARCHAR(50) DEFAULT 'draft',
    destination_url TEXT NOT NULL,
    destination_type VARCHAR(50),
    targeting_config JSONB,
    creative_assets JSONB,
    placements VARCHAR(50)[],
    optimization_goal VARCHAR(50) DEFAULT 'clicks',
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS traffic_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES traffic_campaigns(id),
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    source_url TEXT,
    destination_url TEXT,
    placement VARCHAR(100),
    position INTEGER,
    landed BOOLEAN DEFAULT FALSE,
    bounce BOOLEAN,
    session_duration_ms INTEGER,
    pages_viewed INTEGER,
    converted BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- 3. Engagement Campaigns
CREATE TABLE IF NOT EXISTS engagement_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) DEFAULT 'engagement',
    content_id VARCHAR(255),
    content_type VARCHAR(50),
    content_url TEXT,
    engagement_types VARCHAR(50)[],
    targeting_config JSONB,
    creative_assets JSONB,
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engagement_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES engagement_campaigns(id),
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    action_type VARCHAR(50),
    content_id VARCHAR(255),
    action_data JSONB,
    source_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- 4. Lead Generation
CREATE TABLE IF NOT EXISTS lead_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    fields JSONB NOT NULL,
    submit_button_text VARCHAR(100) DEFAULT 'Submit',
    privacy_policy_url TEXT,
    success_message TEXT,
    progressive_profiling BOOLEAN DEFAULT FALSE,
    enable_captcha BOOLEAN DEFAULT TRUE,
    theme_config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leadgen_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    offer_type VARCHAR(50),
    offer_title VARCHAR(255),
    offer_description TEXT,
    offer_asset_url TEXT,
    form_id UUID REFERENCES lead_forms(id),
    thank_you_page_url TEXT,
    confirmation_email_template_id UUID,
    targeting_config JSONB,
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES leadgen_campaigns(id),
    form_id UUID REFERENCES lead_forms(id),
    user_id UUID REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    job_title VARCHAR(100),
    phone VARCHAR(50),
    custom_data JSONB,
    source_url TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    lead_score INTEGER DEFAULT 0,
    lead_grade VARCHAR(10),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Conversion Campaigns
CREATE TABLE IF NOT EXISTS conversion_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    product_ids TEXT[],
    category_ids TEXT[],
    discount_type VARCHAR(50),
    discount_value DECIMAL(10,2),
    promo_code VARCHAR(50),
    optimization_goal VARCHAR(50) DEFAULT 'purchase',
    target_roas DECIMAL(10,2),
    daily_budget DECIMAL(10,2),
    start_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Remarketing Audiences
CREATE TABLE IF NOT EXISTS remarketing_audiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    rules JSONB NOT NULL,
    lookback_days INTEGER DEFAULT 30,
    exclude_converters BOOLEAN DEFAULT TRUE,
    member_count INTEGER DEFAULT 0,
    last_refreshed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS remarketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    audience_id UUID REFERENCES remarketing_audiences(id),
    use_dynamic_content BOOLEAN DEFAULT FALSE,
    incentive_type VARCHAR(50),
    incentive_value DECIMAL(10,2),
    max_impressions_per_user INTEGER DEFAULT 5,
    min_hours_between_impressions INTEGER DEFAULT 24,
    start_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Universal Event Tracking
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    event_type VARCHAR(100),
    event_name VARCHAR(255) NOT NULL,
    properties JSONB,
    campaign_id UUID,
    source VARCHAR(100) DEFAULT 'web',
    device_info JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_campaign_id ON events(campaign_id);
