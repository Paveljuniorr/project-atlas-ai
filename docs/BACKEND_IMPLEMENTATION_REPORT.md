# Project Atlas AI — Backend Implementation Report

| Document | Backend & Integration Engine MVP |
|---|---|
| **Version** | 1.0 |
| **Date** | 12 August 2026 |
| **Build status** | `npm run build` passes |

---

## 1. Backend Architecture

Modular backend under `src/server/` within the Next.js App Router:

```
src/server/
├── api/response.ts          # Standard success/error JSON envelope
├── auth/context.ts          # Re-exports getUserContext
├── db/client.ts             # Supabase service client
├── security/crypto.ts       # Hashing, encryption, webhook signing
├── events/
│   ├── types.ts             # Domain event catalog
│   └── event-bus.ts         # emitEvent + audit logging
├── integrations/
│   ├── types.ts             # Provider interfaces
│   ├── providers/index.ts   # Twilio, WhatsApp Cloud, Resend
│   └── integration-service.ts
├── automation/dispatcher.ts # n8n webhook dispatch + registration
├── ai/ai-service.ts         # OpenAI/Google AI + controlled tools
└── services/
    ├── lead-service.ts
    ├── conversation-engine.ts
    ├── appointment-service.ts
    └── dashboard-service.ts
```

**Pattern:** Server Actions and Route Handlers → `getUserContext()` → domain services → Supabase (service role) → event bus → automation webhooks.

---

## 2. Database Changes

**Migration:** `supabase/migrations/20260812_backend_engine.sql`

| Addition | Purpose |
|---|---|
| Extended `users` | Decoupled from Supabase Auth; Google ID; expanded roles |
| Extended `leads` | score, intent, notes, follow-up timestamps, metadata |
| Extended `integrations` | provider, encrypted credentials |
| `tasks`, `meetings`, `appointments` | Task list + calendar booking |
| `contacts`, `knowledge_base` | Identity + AI context |
| `api_keys` | Organization API access |
| `audit_logs` | Tenant-isolated audit trail |
| `idempotency_keys` | Webhook deduplication |
| `webhook_deliveries` | Outbound automation log |
| `automation_runs/steps/logs` | Internal automation engine foundation |
| `notifications`, `invitations` | User notifications + team invites |
| `analytics_daily_aggregates` | KPI rollups (schema ready) |

**Preserved:** Original `0000_init.sql` tables and relationships.

**Apply migrations:**
```bash
supabase db push
# or run SQL files in Supabase SQL Editor in order
```

---

## 3. API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/dashboard` | Session | Live dashboard metrics |
| GET/POST | `/api/v1/leads` | Session / API key | List/create leads |
| GET/PATCH/DELETE | `/api/v1/leads/[id]` | Session | Lead CRUD |
| POST | `/api/v1/conversations/[id]/messages` | Session | Send outbound message |
| POST | `/api/v1/ai/drafts` | Session | Generate AI draft |
| GET/POST | `/api/v1/integrations` | Session (Admin+) | List/connect integrations |
| GET/POST | `/api/v1/automations` | Session (Admin+) | n8n webhooks |
| POST | `/api/public/leads` | Public (rate limited) | Website lead capture |
| GET/POST | `/api/webhooks/whatsapp` | Signature | Meta Cloud API |
| POST | `/api/webhooks/twilio` | Rate limit | Twilio WhatsApp/SMS |
| POST | `/api/webhooks/stripe` | Stripe signature | Billing events |

**Response format:**
```json
{ "success": true, "data": {} }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

---

## 4. Authentication Architecture

- **Primary:** Google OAuth via NextAuth (`/api/auth/[...nextauth]`)
- **Flow:** Continue with Google → provision user + org on first login → redirect `/dashboard`
- **Session:** JWT access via NextAuth; middleware protects app routes
- **No username/password signup** (per requirements)
- **API keys:** Bearer `atlas_*` tokens for `/api/v1/*` (hashed in `api_keys`)

---

## 5. Authorization Model

Roles: **Owner, Admin, Manager, Sales, Support, Member**

Enforced in `src/lib/rbac.ts` via permission strings (`leads:read`, `integrations:manage`, etc.).

| Permission | Owner/Admin | Manager | Sales | Support |
|---|---|---|---|---|
| Integrations | ✓ | ✗ | ✗ | ✗ |
| Automations | ✓ | ✗ | ✗ | ✗ |
| Send messages | ✓ | ✓ | ✓ | ✓ |
| AI generate | ✓ | ✓ | ✓ | ✓ |
| Analytics | ✓ | ✓ | ✓ | Limited |

**Tenant isolation:** `orgId` derived from authenticated user record — never from request body.

---

## 6. Integration Architecture

**Provider adapter pattern** (`IntegrationProvider`, `MessagingProvider`, `CalendarProvider`):

```
Business logic → integration-service → createMessagingProvider(id, credentials)
```

**Implemented providers (MVP):**
| Provider ID | Channel | Status |
|---|---|---|
| `twilio` | WhatsApp/SMS | Implemented |
| `whatsapp_cloud` | WhatsApp | Implemented |
| `resend` | Email | Implemented |

**Architecture ready for:** 360dialog, SendGrid, Mailgun, SES, Google Calendar, Cal.com, Calendly.

Credentials stored as AES-256-GCM ciphertext in `integrations.credentials_ciphertext`.

---

## 7. WhatsApp Implementation

- Inbound: `/api/webhooks/whatsapp` (Cloud API) and `/api/webhooks/twilio`
- Signature verification (Meta `X-Hub-Signature-256`)
- Normalized via `parseInboundWebhook()` → `ingestInboundMessage()`
- Outbound: provider adapter `sendMessage()` from conversation engine
- Idempotency via `idempotency_keys` + unique index on `external_message_id`

---

## 8. Email Implementation

- **Resend provider** for outbound email
- Connect via `POST /api/v1/integrations` with `type: email`, `provider: resend`
- Inbound email sync: architecture ready; not fully implemented in MVP (requires Gmail/Graph polling worker)

---

## 9. Calendar Implementation

- **`appointments` table** with double-booking check in `appointment-service.ts`
- **`getAvailableSlots()`** — business hours slot generation minus existing appointments
- **`createAppointment()`** — conflict detection, lead stage update, events
- **Google Calendar / Cal.com adapters:** interface defined; external sync not wired in MVP

---

## 10. Automation Engine

**Internal model:**
- `automations` — webhook endpoint registrations
- `automation_runs`, `automation_steps`, `automation_logs` — execution trace (schema ready)
- `webhook_deliveries` — delivery attempts with retry backoff

**Event bus** emits domain events → `dispatchAutomationWebhooks()` → signed HTTPS POST to customer n8n URLs.

**Starter events:** `lead.created`, `lead.updated`, `lead.stage_changed`, `message.received`, `message.sent`, `appointment.created`, `ai.draft_generated`, etc.

---

## 11. n8n Integration

- Optional layer — core logic runs in Atlas
- Register webhook: `POST /api/v1/automations` → returns secret (shown once)
- Headers: `X-Atlas-Event`, `X-Atlas-Signature`, `X-Atlas-Delivery`, `X-Atlas-Timestamp`
- Retry: 5 attempts with exponential backoff

---

## 12. AI Architecture

- **Abstraction:** OpenAI (`gpt-4o-mini`) or Google Gemini via `AI_PROVIDER` env
- **Human-in-the-loop:** drafts stored in `ai_responses`; send requires agent approval
- **Controlled tools:** `getLead`, `updateLead`, `searchKnowledgeBase`, `getAvailableSlots`, `createAppointment`
- **Guardrails:** knowledge snippets from org settings + `knowledge_base` table; no raw DB access from model

---

## 13. Security Controls

| Control | Implementation |
|---|---|
| Tenant isolation | `org_id` on all queries + `getUserContext()` |
| RBAC | Permission checks on every server action/API route |
| Webhook verification | Meta HMAC, Stripe signature, idempotency keys |
| Rate limiting | In-memory limiter on auth-sensitive routes |
| Secret storage | Server env only; credentials encrypted at rest |
| Input validation | Zod schemas |
| Audit logging | `audit_logs` table |
| XSS mitigation | `sanitizeHtml()` on user input |
| API keys | SHA-256 hashed; scopes; expiry support |

---

## 14. Tests Implemented

`tests/security.test.ts` (Vitest):
- Secret hashing consistency
- Webhook signature verification
- Email/phone normalization
- Tenant isolation documentation test

**Run:** `npm test`

**Recommended next tests:** cross-tenant access integration tests with Supabase test DB, RLS policy verification, double-booking, duplicate webhooks.

---

## 15. Remaining Limitations

| Area | Status |
|---|---|
| Inbound email sync (Gmail/Outlook) | Architecture only |
| Google Calendar / Cal.com external sync | Architecture only |
| Full automation step executor (wait, branch) | Schema only; n8n handles complex flows |
| Supabase Realtime subscriptions in UI | Not wired |
| Settings integrations UI | Static placeholder — use API |
| Tasks/Meetings pages | Client mock data — DB tables exist |
| Analytics page | Static — dashboard API has real metrics |
| Instagram/Facebook/Telegram | Excluded from MVP |
| Background job queue | Uses setTimeout retry (production: BullMQ/Inngest) |
| `20260812_rbac_rls.sql` | Has stale column names — superseded by backend migration |

---

## 16. Environment Variables Required

See `.env.example`:

- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`
- `INTEGRATION_ENCRYPTION_KEY`
- Optional: `WHATSAPP_*`, `TWILIO_*`, `RESEND_*`, `STRIPE_*`

---

## 17. How to Run Locally

```bash
cp .env.example .env.local
# Fill in Supabase + Google OAuth + AI keys

npm install
supabase db push   # or apply migrations manually

npm run dev
# Open http://localhost:3000/sign-in
```

---

## 18. How to Deploy to Vercel

1. Push repository to GitHub
2. Import project in Vercel (Framework: Next.js)
3. Set all environment variables from `.env.example`
4. Deploy — serverless functions host API routes automatically
5. Configure webhook URLs:
   - WhatsApp: `https://your-domain.com/api/webhooks/whatsapp`
   - Twilio: `https://your-domain.com/api/webhooks/twilio`
6. Run Supabase migrations against production database

---

## Frontend Integration Summary

| Page | Status |
|---|---|
| `/dashboard` | **Live data** from `getDashboardMetrics()` |
| `/leads` | **Live data** via server actions |
| `/inbox` | **Live data** — AI draft + send message wired |
| `/settings` | Static UI — connect via API |
| `/tasks`, `/meetings` | Mock client data — backend tables ready |
| `/analytics` | Static — use `/api/v1/dashboard` pattern next |

---

*End of Implementation Report*
