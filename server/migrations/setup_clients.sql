-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    status TEXT DEFAULT 'Active',
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create client_history table
CREATE TABLE IF NOT EXISTS public.client_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    action_type TEXT NOT NULL, -- e.g., 'view', 'click', 'export'
    details JSONB DEFAULT '{}'::jsonb,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_history ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Clients: Only Admin can view/edit
DROP POLICY IF EXISTS "Enable all access for all users" ON public.clients;
CREATE POLICY "Admin only access" ON public.clients
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'rahul7697762@gmail.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'rahul7697762@gmail.com');

-- 2. Client History: Only Admin can view/edit
DROP POLICY IF EXISTS "Enable all access for all users" ON public.client_history;
CREATE POLICY "Admin only access" ON public.client_history
    FOR ALL
    USING (auth.jwt() ->> 'email' = 'rahul7697762@gmail.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'rahul7697762@gmail.com');
