-- 7. App Promotion Campaigns
CREATE TABLE IF NOT EXISTS app_promotion_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) DEFAULT 'app_install',
    status VARCHAR(50) DEFAULT 'draft',
    app_name VARCHAR(255) NOT NULL,
    app_store_url TEXT NOT NULL,
    app_icon_url TEXT,
    platform VARCHAR(50), -- ios, android, both
    targeting_config JSONB,
    creative_assets JSONB,
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Local Business Campaigns
CREATE TABLE IF NOT EXISTS local_business_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) DEFAULT 'store_visits',
    status VARCHAR(50) DEFAULT 'draft',
    business_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    map_location JSONB, -- { lat: ..., lng: ... }
    radius_km INTEGER DEFAULT 5,
    cta_type VARCHAR(50) DEFAULT 'get_directions', -- call_now, get_directions
    contact_phone VARCHAR(50),
    targeting_config JSONB,
    creative_assets JSONB,
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Offer & Event Campaigns
CREATE TABLE IF NOT EXISTS offer_event_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'offer', -- offer, event
    objective VARCHAR(100) DEFAULT 'claims', -- claims, responses
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Offer specifics
    offer_title VARCHAR(255),
    offer_details TEXT,
    discount_type VARCHAR(50), -- percentage, fixed_amount
    discount_value DECIMAL(10,2),
    claim_limit INTEGER,
    code_redemption_url TEXT,

    -- Event specifics
    event_name VARCHAR(255),
    event_time TIMESTAMP,
    event_location TEXT,
    ticket_url TEXT,

    targeting_config JSONB,
    creative_assets JSONB,
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_campaigns_user ON app_promotion_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_local_campaigns_user ON local_business_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_offer_campaigns_user ON offer_event_campaigns(created_by);
