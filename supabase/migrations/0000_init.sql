-- Project Atlas AI MVP - Supabase PostgreSQL Schema

-- 1. Organizations (Tenants)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trial', 'suspended', 'churned')),
    logo_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    default_language TEXT DEFAULT 'en',
    ai_settings JSONB DEFAULT '{"tone": "professional", "humanInTheLoop": true}'::jsonb,
    pipeline_stages JSONB DEFAULT '[{"id": "new", "name": "New", "order": 0, "isTerminal": false}, {"id": "contacted", "name": "Contacted", "order": 1, "isTerminal": false}, {"id": "qualified", "name": "Qualified", "order": 2, "isTerminal": false}, {"id": "won", "name": "Won", "order": 3, "isTerminal": true}, {"id": "lost", "name": "Lost", "order": 4, "isTerminal": true}]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users (tied to auth.users in Supabase)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'agent', 'viewer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated', 'pending')),
    notification_preferences JSONB DEFAULT '{"inApp": {"newLead": true, "assignment": true, "messageReceived": true}, "email": {"assignment": true}}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Leads (CRM)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'merged')),
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    source TEXT DEFAULT 'manual',
    stage_id TEXT NOT NULL DEFAULT 'new',
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    tags TEXT[],
    unread_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Conversations (Omnichannel threads)
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'chat', 'sms')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'snoozed')),
    external_thread_id TEXT,
    participant_address TEXT,
    last_message_preview TEXT,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    content_type TEXT NOT NULL DEFAULT 'text',
    body TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('lead', 'user', 'system', 'ai')),
    sender_id UUID REFERENCES public.users(id),
    external_message_id TEXT,
    ai_response_id UUID, -- References ai_responses if we create one
    is_ai_assisted BOOLEAN DEFAULT false,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AI Responses (Drafts)
CREATE TABLE public.ai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    trigger_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'accepted', 'edited', 'rejected', 'expired')),
    draft_body TEXT NOT NULL,
    final_body TEXT,
    sent_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    model JSONB,
    requested_by_id UUID REFERENCES public.users(id),
    accepted_by_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Integrations
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'chat_widget', 'twilio', 'cal_com')),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
    config JSONB DEFAULT '{}'::jsonb,
    health JSONB DEFAULT '{"status": "healthy"}'::jsonb,
    connected_by_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Automations (Webhooks)
CREATE TABLE public.automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled')),
    endpoint_url TEXT NOT NULL,
    subscribed_events TEXT[] NOT NULL,
    secret_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Setup (Row Level Security)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- Simple Org Isolation Policies
CREATE POLICY "Users can view their own org" ON public.organizations FOR SELECT USING (id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can view users in their org" ON public.users FOR SELECT USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can view leads in their org" ON public.leads FOR ALL USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can view conversations in their org" ON public.conversations FOR ALL USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can view messages in their org" ON public.messages FOR ALL USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can view ai_responses in their org" ON public.ai_responses FOR ALL USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can view integrations in their org" ON public.integrations FOR ALL USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Users can view automations in their org" ON public.automations FOR ALL USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Functions and Triggers
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_org_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_user_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_lead_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_conversation_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_ai_response_updated_at BEFORE UPDATE ON public.ai_responses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_integration_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_automation_updated_at BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RPC for atomic unread count increment
CREATE OR REPLACE FUNCTION increment_unread_count(conv_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.conversations
  SET unread_count = unread_count + 1
  WHERE id = conv_id;
END;
$$ LANGUAGE plpgsql;
