-- Migration: 026_user_workflows.sql
-- Description: Create user_workflows table to associate Dograh Agent/Workflow IDs with users

CREATE TABLE IF NOT EXISTS public.user_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workflow_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, workflow_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_workflows_user_id ON public.user_workflows(user_id);

-- Enable RLS
ALTER TABLE public.user_workflows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see only their own workflows
CREATE POLICY "Users can view own workflows" ON public.user_workflows
    FOR SELECT USING (true); -- Set to true for simple access, in prod can be: auth.uid() = user_id

-- Policy: Users can insert/update/delete their own workflows
CREATE POLICY "Users can modify own workflows" ON public.user_workflows
    FOR ALL USING (true);

-- Seed initial test workflows for user sashanksingh12205@gmail.com (ID: f964f465-aa99-4d5a-8682-e7fd80b60ded)
INSERT INTO public.user_workflows (user_id, workflow_id, workflow_name)
VALUES 
('f964f465-aa99-4d5a-8682-e7fd80b60ded', '45b42390-369b-49b5-9a26-21a099dc843e', 'Property Buyer Lead Call'),
('f964f465-aa99-4d5a-8682-e7fd80b60ded', '7ef7deb5-7e2d-4616-8ea5-93914314bccf', 'Seller Followup Call')
ON CONFLICT (user_id, workflow_id) DO NOTHING;
