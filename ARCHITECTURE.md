# Project Atlas AI — Architecture & Integration Engine Documentation

## 1. Overview
Project Atlas AI is an autonomous **Revenue Operating System** designed for high-velocity sales and customer operations teams. It manages the full lifecycle:
$$\text{Lead Ingestion} \longrightarrow \text{Lead Qualification} \longrightarrow \text{Omnichannel AI Conversation} \longrightarrow \text{Appointment Booking} \longrightarrow \text{CRM \& Workflows}$$

---

## 2. Layered Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend (Next.js 16 + React 19)         │
│   Dashboard, Pipeline, Unified Inbox, Meetings, Tasks  │
└──────────────────────────┬─────────────────────────────┘
                           │ (Clerk Auth Session / API Bearer Key)
┌──────────────────────────▼─────────────────────────────┐
│                    Atlas API Layer                     │
│  /api/v1/leads, /conversations, /appointments, /tasks  │
└────────┬─────────────────┬─────────────────┬───────────┘
         │                 │                 │
┌────────▼────────┐┌───────▼────────┐┌───────▼───────────┐
│ RBAC & Context  ││ Input Valid.   ││ Rate Limiter      │
│ (src/lib/rbac)  ││ (Zod Schemas)  ││ (Sliding Window)  │
└────────┬────────┘└───────┬────────┘└───────┬───────────┘
         │                 │                 │
┌────────▼─────────────────▼─────────────────▼───────────┐
│                 Core Business Services                 │
│  LeadService, ConversationEngine, AppointmentService,  │
│  TaskService, NotificationService, TeamService         │
└────────┬─────────────────┬─────────────────┬───────────┘
         │                 │                 │
┌────────▼────────┐┌───────▼────────┐┌───────▼───────────┐
│  AI Service     ││ Integration    ││   Event Bus       │
│  (Multi-Model)  ││ Framework      ││  (22 Domain Evts) │
└────────┬────────┘└───────┬────────┘└───────┬───────────┘
         │                 │                 │
┌────────▼────────┐┌───────▼────────┐┌───────▼───────────┐
│ Gemini / OpenAI ││ Twilio, Meta   ││ n8n Webhooks,     │
│ Providers       ││ Resend, Cal.com││ Audit Logs        │
└─────────────────┘└────────────────┘└───────────────────┘
```

---

## 3. Authentication & Workspace Provisioning

### Flow:
1. **User clicks "Continue with Google"** on the landing page or `/sign-in`.
2. **Clerk Social Connection** handles Google OAuth securely with PKCE.
3. Upon first sign-in:
   - Atlas AI derives the user's Google profile from Clerk (`currentUser()`).
   - Checks Supabase `users` table.
   - If not found:
     - Automatically creates a tenant organization: `"{Name}'s Workspace"`.
     - Inserts the user record with role **`Owner`** and `status: "active"`.
     - Writes a `user.signup` audit log.
   - If existing:
     - Updates `last_login_at` and profile picture.
4. **Redirects directly to `/dashboard`**.

---

## 4. Multi-Tenancy & Authorization

### Tenant Isolation:
- Every entity table (`leads`, `conversations`, `messages`, `tasks`, `appointments`, `integrations`, `automations`, `audit_logs`) includes an `org_id UUID NOT NULL` column.
- **Server Enforcement**: `getUserContext()` strictly resolves `orgId` from the authenticated user record in Supabase — client-supplied `organization_id` is never trusted.
- **Database Enforcement**: Supabase Row Level Security (RLS) policies restrict all queries to rows matching the authenticated tenant.

### Role-Based Access Control (RBAC):
| Role | Permissions |
|---|---|
| **Owner** | Full workspace management, billing, team invitations, API keys, integrations, automations, all CRM records |
| **Admin** | Full management except workspace destruction |
| **Manager** | Lead management, conversations, appointments, analytics, team task assignment |
| **Sales** | Assigned leads, conversations, booking appointments, managing tasks |
| **Support** | Conversation triage, AI assistance, read-only lead history |
| **Member** | Read-only analytics, tasks, and meetings |

---

## 5. Integration Framework (Provider Adapter Architecture)

The system does **NOT** hardcode third-party APIs directly in CRM code. Every integration implements standard interfaces defined in `src/server/integrations/types.ts`:

- `MessagingProvider` — WhatsApp Cloud API, Twilio SMS/WhatsApp
- `EmailProvider` — Resend, SendGrid, SMTP
- `CalendarProvider` — Google Calendar, Cal.com, Outlook
- `AutomationProvider` — n8n bidirectional webhooks

### Security:
- All third-party credentials (API keys, access tokens, webhook secrets) are encrypted on the server using **AES-256-GCM** before database storage.
- Raw tokens are never returned to the frontend.

---

## 6. Webhooks & Automation Engine

1. **Inbound Webhooks** (`/api/webhooks/whatsapp`, `/api/webhooks/twilio`, `/api/webhooks/stripe`, `/api/webhooks/n8n`):
   - HMAC SHA-256 signature verification.
   - In-memory rate limiting (60–120 req/min).
   - Idempotency deduplication using `idempotency_keys` table.
2. **Outbound Automations & n8n**:
   - Every domain event (`lead.created`, `lead.qualified`, `appointment.created`, etc.) emits through `src/server/events/event-bus.ts`.
   - `src/server/automation/dispatcher.ts` delivers HMAC-signed webhooks to registered endpoints (including n8n) with automatic exponential backoff retry.

---

## 7. API Endpoints Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/dashboard` | `GET` | Aggregated revenue and pipeline metrics |
| `/api/v1/leads` | `GET`, `POST` | List leads (paginated/filtered) and create lead |
| `/api/v1/leads/[id]` | `GET`, `PATCH`, `DELETE` | Lead detail, update stage/score, archive |
| `/api/v1/conversations` | `GET` | List omnichannel message threads |
| `/api/v1/conversations/[id]/messages` | `POST` | Send outbound message via active integration |
| `/api/v1/appointments` | `GET`, `POST` | List and book appointments |
| `/api/v1/appointments/slots` | `GET` | Get real-time available calendar slots |
| `/api/v1/tasks` | `GET`, `POST`, `PATCH`, `DELETE` | Workspace task pipeline |
| `/api/v1/integrations` | `GET`, `POST` | List and connect channel providers |
| `/api/v1/automations` | `GET`, `POST` | Register webhook automation endpoints |
| `/api/v1/api-keys` | `GET`, `POST`, `DELETE` | Generate scoped API keys and revoke |
| `/api/v1/team` | `GET`, `POST`, `PATCH`, `DELETE` | Team members, invitations, and role management |
| `/api/v1/settings` | `GET`, `PATCH` | Workspace settings and AI communication tone |
| `/api/public/leads` | `POST` | Honeypot-protected public website lead ingestion |
| `/api/webhooks/*` | `POST` | Verified inbound webhooks (Twilio, WhatsApp, n8n, Stripe) |

---

## 8. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables in .env.local
cp .env.example .env.local

# 3. Start development server
npm run dev
# Live at http://localhost:3000
```
