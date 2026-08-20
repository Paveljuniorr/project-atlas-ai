-- Project Atlas AI — Backend Engine Migration
-- Extends MVP schema without destroying existing data

-- ---------------------------------------------------------------------------
-- 1. Users: decouple from Supabase Auth (NextAuth Google), expand roles
-- ---------------------------------------------------------------------------
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('Owner', 'Admin', 'Manager', 'Sales', 'Support', 'Member', 'owner', 'admin', 'agent', 'viewer'));

-- Normalize legacy lowercase roles
UPDATE public.users SET role = 'Owner' WHERE role = 'owner';
UPDATE public.users SET role = 'Admin' WHERE role = 'admin';
UPDATE public.users SET role = 'Sales' WHERE role = 'agent';
UPDATE public.users SET role = 'Member' WHERE role = 'viewer';

-- Add columns if missing (NextAuth provisioning)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

UPDATE public.users SET name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- ---------------------------------------------------------------------------
-- 2. Leads: extended CRM fields
-- ---------------------------------------------------------------------------
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS intent TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_source_check;
-- Allow extended sources (application validates enum)

-- ---------------------------------------------------------------------------
-- 3. Integrations: provider abstraction + encrypted credentials
-- ---------------------------------------------------------------------------
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_type_check;
ALTER TABLE public.integrations ADD CONSTRAINT integrations_type_check
  CHECK (type IN (
    'whatsapp', 'email', 'chat_widget', 'twilio', 'cal_com',
    'google_calendar', 'microsoft_calendar', 'calendly', 'n8n', 'crm'
  ));

ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS credentials_ciphertext TEXT;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS credentials_key_version INTEGER DEFAULT 1;
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS credentials_expires_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS integrations_org_type_provider_idx
  ON public.integrations (org_id, type, COALESCE(provider, 'default'))
  WHERE status = 'connected';

-- ---------------------------------------------------------------------------
-- 4. Tasks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    lead TEXT,
    done BOOLEAN NOT NULL DEFAULT false,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5. Appointments / Meetings (unified)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    attendee_name TEXT,
    attendee_email TEXT,
    attendee_phone TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
      'scheduled', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'
    )),
    provider TEXT,
    external_event_id TEXT,
    meeting_link TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_org_user_time_idx
  ON public.appointments (org_id, assigned_user_id, starts_at, ends_at)
  WHERE status IN ('scheduled', 'confirmed');

-- Legacy meetings view/table alias for existing code
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    lead TEXT,
    company TEXT,
    time TEXT,
    date TEXT,
    platform TEXT DEFAULT 'Google Meet',
    link TEXT,
    status TEXT DEFAULT 'Upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 6. Contacts (identity resolution)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    email TEXT,
    email_normalized TEXT,
    phone TEXT,
    phone_normalized TEXT,
    name TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contacts_org_email_idx ON public.contacts (org_id, email_normalized) WHERE email_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS contacts_org_phone_idx ON public.contacts (org_id, phone_normalized) WHERE phone_normalized IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 7. Knowledge base
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 8. API keys (organization API access)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS api_keys_hash_idx ON public.api_keys (key_hash);

-- ---------------------------------------------------------------------------
-- 9. Audit logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL DEFAULT 'user',
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    summary TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    correlation_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_org_created_idx ON public.audit_logs (org_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 10. Idempotency keys (webhook dedup)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    key TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (org_id, source, key)
);

-- ---------------------------------------------------------------------------
-- 11. Webhook deliveries (outbound automations)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    automation_id UUID REFERENCES public.automations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_id TEXT NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
    attempt INTEGER NOT NULL DEFAULT 1,
    http_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- 12. Automation engine extensions
-- ---------------------------------------------------------------------------
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS trigger_config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.automations ADD COLUMN IF NOT EXISTS actions_config JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.automations DROP CONSTRAINT IF EXISTS automations_status_check;
ALTER TABLE public.automations ADD CONSTRAINT automations_status_check
  CHECK (status IN ('enabled', 'disabled', 'draft', 'active', 'paused', 'failed', 'completed'));

CREATE TABLE IF NOT EXISTS public.automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),
    trigger_event TEXT NOT NULL,
    trigger_payload JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS public.automation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.automation_runs(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    step_index INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    input JSONB,
    output JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    run_id UUID REFERENCES public.automation_runs(id) ON DELETE CASCADE,
    level TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 13. Notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    entity JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 14. Invitations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    email_normalized TEXT NOT NULL,
    role TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    invited_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 15. Analytics daily aggregates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_daily_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    by_channel JSONB DEFAULT '{}'::jsonb,
    by_source JSONB DEFAULT '{}'::jsonb,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (org_id, date)
);

-- ---------------------------------------------------------------------------
-- 16. Message idempotency index
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS messages_external_id_idx
  ON public.messages (org_id, channel, external_message_id)
  WHERE external_message_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 17. RLS — enable on new tables
-- ---------------------------------------------------------------------------
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_aggregates ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; app enforces tenant via getUserContext + org_id filters.
-- Authenticated Supabase client policies (when using Supabase Auth JWT):
DO $$ BEGIN
  CREATE POLICY "tenant_tasks" ON public.tasks FOR ALL
    USING (org_id IN (SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_meetings" ON public.meetings FOR ALL
    USING (org_id IN (SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tenant_appointments" ON public.appointments FOR ALL
    USING (org_id IN (SELECT org_id FROM public.users WHERE email = auth.jwt() ->> 'email'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 18. Updated triggers
-- ---------------------------------------------------------------------------
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
