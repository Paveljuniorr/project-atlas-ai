-- Migration: Enable Row Level Security (RLS) and Tenant Isolation
-- Date: 2026-08-12

-- 1. Enable RLS on core tables
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent duplicate errors
DROP POLICY IF EXISTS "Tenant Isolation: Organizations" ON public.organizations;
DROP POLICY IF EXISTS "Tenant Isolation: Users" ON public.users;
DROP POLICY IF EXISTS "Tenant Isolation: Leads" ON public.leads;
DROP POLICY IF EXISTS "Tenant Isolation: Conversations" ON public.conversations;
DROP POLICY IF EXISTS "Tenant Isolation: Messages" ON public.messages;
DROP POLICY IF EXISTS "Tenant Isolation: AI Responses" ON public.ai_responses;
DROP POLICY IF EXISTS "Tenant Isolation: Tasks" ON public.tasks;
DROP POLICY IF EXISTS "Tenant Isolation: Meetings" ON public.meetings;
DROP POLICY IF EXISTS "Tenant Isolation: Appointments" ON public.appointments;

-- 2. Organizations RLS Policy
CREATE POLICY "Tenant Isolation: Organizations" ON public.organizations
  FOR ALL
  USING (id IN (
    SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'
  ));

-- 3. Users RLS Policy
CREATE POLICY "Tenant Isolation: Users" ON public.users
  FOR ALL
  USING (org_id IN (
    SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'
  ));

-- 4. Leads RLS Policy
CREATE POLICY "Tenant Isolation: Leads" ON public.leads
  FOR ALL
  USING (org_id IN (
    SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'
  ));

-- 5. Conversations RLS Policy
CREATE POLICY "Tenant Isolation: Conversations" ON public.conversations
  FOR ALL
  USING (org_id IN (
    SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'
  ));

-- 6. Messages RLS Policy
CREATE POLICY "Tenant Isolation: Messages" ON public.messages
  FOR ALL
  USING (org_id IN (
    SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'
  ));

-- 7. AI Responses RLS Policy
CREATE POLICY "Tenant Isolation: AI Responses" ON public.ai_responses
  FOR ALL
  USING (org_id IN (
    SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'
  ));

-- 8. Tasks RLS Policy
CREATE POLICY "Tenant Isolation: Tasks" ON public.tasks
  FOR ALL
  USING (org_id IN (
    SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'
  ));

-- 9. Meetings RLS Policy
CREATE POLICY "Tenant Isolation: Meetings" ON public.meetings
  FOR ALL
  USING (org_id IN (
    SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'
  ));

-- 10. Appointments RLS Policy
CREATE POLICY "Tenant Isolation: Appointments" ON public.appointments
  FOR ALL
  USING (org_id IN (
    SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'
  ));
