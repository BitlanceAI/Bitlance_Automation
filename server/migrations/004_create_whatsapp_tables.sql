-- Create table for WhatsApp Templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- TRANSACTIONAL, MARKETING, AUTHENTICATION
    language VARCHAR(10) DEFAULT 'en',
    header_text TEXT,
    body_text TEXT NOT NULL,
    footer_text TEXT,
    buttons JSONB, -- Array of button objects
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for WhatsApp Broadcasts (Campaigns)
CREATE TABLE IF NOT EXISTS whatsapp_broadcasts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES whatsapp_templates(id),
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SCHEDULED, SENDING, COMPLETED, FAILED
    scheduled_for TIMESTAMP WITH TIME ZONE,
    total_recipients INTEGER DEFAULT 0,
    successful_sends INTEGER DEFAULT 0,
    failed_sends INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for WhatsApp Contacts (Recipients) and their interaction history
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE, -- E.164 format
    name VARCHAR(255),
    opt_in_status BOOLEAN DEFAULT FALSE,
    opt_in_date TIMESTAMP WITH TIME ZONE,
    last_interaction TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for Broadcast Logs (Individual message status)
CREATE TABLE IF NOT EXISTS whatsapp_broadcast_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    broadcast_id UUID REFERENCES whatsapp_broadcasts(id),
    contact_id UUID REFERENCES whatsapp_contacts(id),
    status VARCHAR(20) DEFAULT 'QUEUED', -- QUEUED, SENT, DELIVERED, READ, FAILED
    message_sid VARCHAR(100), -- From Twilio/BSP
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_broadcast_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (Assuming authenticated users can access all for now, refine based on requirements)
CREATE POLICY "Allow authenticated users to read templates" ON whatsapp_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert templates" ON whatsapp_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update templates" ON whatsapp_templates FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read broadcasts" ON whatsapp_broadcasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert broadcasts" ON whatsapp_broadcasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update broadcasts" ON whatsapp_broadcasts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read contacts" ON whatsapp_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert contacts" ON whatsapp_contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update contacts" ON whatsapp_contacts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read logs" ON whatsapp_broadcast_logs FOR SELECT TO authenticated USING (true);
