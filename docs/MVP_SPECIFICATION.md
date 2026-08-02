# Project Atlas AI — MVP Product Specification

| Document Control | |
|---|---|
| **Product** | Project Atlas AI |
| **Document type** | MVP Product Specification |
| **Version** | 1.0 |
| **Status** | Draft for alignment |
| **Audience** | Product, Engineering, Design, GTM |
| **Last updated** | 14 July 2026 |

---

## 1. Product Overview

**Project Atlas AI** is an AI-powered Lead Management SaaS platform built for small and medium businesses (SMBs). It unifies inbound lead capture, CRM workflows, multi-channel communication (WhatsApp, email, website chat), AI-assisted responses, and lightweight automation so teams can convert more leads with less manual effort.

### Positioning

Project Atlas AI is the operating system for SMB lead flow: capture → qualify → respond → track → convert.

Unlike generic CRMs that stop at record-keeping, or chatbot tools that stop at conversation, Project Atlas AI connects **lead identity**, **conversation context**, and **next-best action** in one workspace—augmented by AI and orchestrated through n8n for reliable automations.

### MVP Value Proposition

> Capture every lead, respond in minutes (not hours), and see what converts—without hiring a larger sales ops team.

### Core Product Pillars (MVP)

| Pillar | What it delivers |
|---|---|
| **Unified Lead CRM** | Single source of truth for contacts, deals/pipeline stages, notes, and activity |
| **Omnichannel Inbox** | WhatsApp, email, and website chat tied to the same lead record |
| **AI Lead Response** | Context-aware draft replies and guided qualification |
| **Automation (n8n)** | Event-driven workflows (assignment, alerts, follow-ups, syncs) |
| **Operational Analytics** | Lead volume, response time, channel mix, conversion funnel |

---

## 2. Problem Statement

SMBs lose revenue not primarily from lack of demand, but from **slow, fragmented, and inconsistent lead handling**.

### Current State (Typical SMB)

1. **Leads arrive from many places** — website forms, WhatsApp Business, email, landing pages, ads—often into disconnected inboxes.
2. **No single owner or system of record** — leads live in spreadsheets, personal phones, and shared email folders.
3. **Response latency kills conversion** — first response often takes hours; after-hours and weekends create dead time.
4. **Replies are inconsistent** — quality depends on who answers, mood, and tribal knowledge.
5. **Follow-up is manual and forgotten** — no reliable sequences or reminders tied to lead stage.
6. **Reporting is guesswork** — founders cannot answer: *Where do leads come from? How fast do we reply? What converts?*

### Consequences

- High drop-off between inquiry and first conversation  
- Lost attribution and duplicate outreach  
- Over-reliance on one “hero” employee who knows every customer thread  
- Inability to scale lead volume without proportional headcount  

### Opportunity

SMBs need a **purpose-built lead management layer**—lighter than enterprise CRM, smarter than a chatbot widget—combining channel connectivity, AI response assist, CRM hygiene, automation, and analytics in one affordable product.

---

## 3. Target Customers

### Primary ICP (Ideal Customer Profile)

| Attribute | Definition |
|---|---|
| **Company size** | 5–150 employees |
| **Buyer / champion** | Founder, Managing Director, Marketing Manager, or Sales Lead |
| **Daily users** | 2–20 people (sales, success, front-office, marketing) |
| **Lead volume** | ~20–2,000 new inbound leads / month |
| **Channels in use** | Website + WhatsApp and/or email as primary response channels |
| **Tech maturity** | Comfortable with SaaS; may use Google Workspace / Microsoft 365; limited engineering |
| **Geography (MVP focus)** | Markets where WhatsApp is a primary business channel (e.g. Africa, LATAM, MENA, SE Asia, parts of Europe), expandable thereafter |

### Priority Verticals (MVP go-to-market)

1. **Professional services** — agencies, consultancies, legal / accounting practices  
2. **Local & regional services** — clinics, education / training centers, home services, real estate agencies  
3. **B2B SMBs with inbound demand** — SaaS startups, distributors, B2B services with website forms and WhatsApp inquiries  

### Buyer Personas

| Persona | Goals | Pain |
|---|---|---|
| **Founder / GM** | Grow revenue without adding ops headcount | Blind to funnel; weekends = lost leads |
| **Sales / Front-office lead** | Reply fast, close more | Triage chaos; context switching across apps |
| **Marketing manager** | Prove channel ROI | Leads “disappear” after handoff |

### Anti-Personas (explicitly not MVP focus)

- Enterprise sales teams needing CPQ, territory management, or complex forecasting  
- Pure outbound cold-calling organizations with no inbound digital leads  
- Companies requiring on-prem / air-gapped deployment  

---

## 4. Business Goals

### Near-term (MVP launch → 90 days)

| Goal | Description |
|---|---|
| **Validate product-market fit** | Confirm ICP willingness to pay for unified lead + AI response + WhatsApp |
| **Activate paying customers** | Convert design partners / early waitlist into paid MVP tenants |
| **Prove retention signal** | Weekly active usage of inbox + CRM among activated seats |
| **Establish delivery reliability** | Stable channel connectors (WhatsApp, email, chat) with clear SLAs |
| **Create a repeatable onboarding path** | Time-to-first-value under a defined threshold (see Success Criteria) |

### Medium-term (post-MVP, directional)

- Expand automation cookbook (n8n templates) as a retention and expansion lever  
- Introduce usage-based or tiered packaging around AI volume and seats  
- Build partner / agency reseller motion for implementation  

### Business Metrics to Instrument Early

- Activation rate (signed up → connected ≥1 channel + created ≥1 lead)  
- Time-to-first-AI-assisted reply  
- Paid conversion and early churn / logo retention  
- Expansion proxies: seats, AI replies, message volume  

---

## 5. User Goals

### Organization / Admin Goals

- Set up the workspace quickly (branding, users, channels, defaults)  
- Connect WhatsApp, email, and website chat without developer dependency where possible  
- Control who can see leads, send messages, and change settings  
- Understand performance via a simple dashboard and analytics  

### Individual User (Agent / Seller) Goals

- See all new leads and open conversations in one place  
- Open a lead and understand full history (CRM fields + messages)  
- Respond faster using AI drafts grounded in lead context  
- Update pipeline stage and notes without leaving the conversation  
- Never lose a follow-up (reminders / stage-based automation)  

### End-Customer (Lead) Goals — indirect but design-critical

- Receive a timely, relevant, human-feeling first reply  
- Continue conversation on their preferred channel (especially WhatsApp)  
- Not receive duplicate / conflicting answers from different staff  

---

## 6. Functional Requirements

Requirements are specified as **Must** (MVP scope) unless marked otherwise.

### 6.1 Authentication & Access Control

| ID | Requirement |
|---|---|
| **AUTH-01** | Users can sign up for a tenant (organization) and verify email |
| **AUTH-02** | Users can sign in with email + password; secure session management |
| **AUTH-03** | Password reset via email |
| **AUTH-04** | Invitation-based team onboarding (admin invites by email) |
| **AUTH-05** | Role-based access: at minimum **Owner/Admin**, **Agent**, **Viewer** (or equivalent) |
| **AUTH-06** | Tenant isolation: users only access data belonging to their organization |
| **AUTH-07** | Ability to revoke access (deactivate user) |

### 6.2 Dashboard

| ID | Requirement |
|---|---|
| **DASH-01** | Homepage overview of today’s / recent lead activity |
| **DASH-02** | Key KPI cards: new leads, open conversations, avg. first-response time, conversions (period selectable) |
| **DASH-03** | Pipeline snapshot (counts by stage) |
| **DASH-04** | Channel mix snapshot (WhatsApp / email / chat / other) |
| **DASH-05** | Quick actions: create lead, open inbox, go to analytics |
| **DASH-06** | Empty states with guided next steps for new workspaces |

### 6.3 CRM (Lead Management)

| ID | Requirement |
|---|---|
| **CRM-01** | Create, read, update, soft-delete (or archive) leads |
| **CRM-02** | Standard lead fields: name, email, phone, company, source, stage, owner, tags, notes |
| **CRM-03** | Configurable pipeline stages (default set provided; rename/reorder within limits) |
| **CRM-04** | Lead list with search, filter (stage, owner, source, channel, date), and sort |
| **CRM-05** | Lead detail view with activity timeline (messages, stage changes, notes, system events) |
| **CRM-06** | Manual lead assignment / reassignment to users |
| **CRM-07** | Duplicate detection assist on create (match by email and/or phone) |
| **CRM-08** | Import leads via CSV (basic mapping) |
| **CRM-09** | Export leads filtered list to CSV |
| **CRM-10** | Associate inbound messages with the correct lead (identity resolution by phone/email) |

### 6.4 AI Lead Response

| ID | Requirement |
|---|---|
| **AI-01** | Generate reply drafts from lead context + conversation history + configurable brand tone |
| **AI-02** | User must review and send (human-in-the-loop by default for outbound) |
| **AI-03** | Support multiple languages based on inbound message language (or user setting) |
| **AI-04** | Suggested qualification questions / next steps based on stage |
| **AI-05** | Workspace-level AI settings: tone, do/don’t rules, FAQ / knowledge snippets |
| **AI-06** | Log AI-assisted vs fully manual sends for analytics |
| **AI-07** | Guardrails: refuse prohibited topics per settings; avoid inventing unavailable facts (pricing, availability) unless provided in knowledge |

### 6.5 WhatsApp Integration

| ID | Requirement |
|---|---|
| **WA-01** | Connect WhatsApp Business-capable channel via supported provider/API (official Cloud API path preferred) |
| **WA-02** | Inbound WhatsApp messages create or attach to leads |
| **WA-03** | Outbound replies from Atlas inbox to WhatsApp |
| **WA-04** | Delivery / status visibility where API provides it (sent / delivered / read if available) |
| **WA-05** | Display WhatsApp conversation thread on lead record |
| **WA-06** | Connection health status and reconnect guidance in Settings |
| **WA-07** | Respect platform templating / window rules (document limitations to users) |

### 6.6 Email Integration

| ID | Requirement |
|---|---|
| **EM-01** | Connect shared / user mailbox via OAuth (Google and/or Microsoft) or SMTP/IMAP where needed |
| **EM-02** | Inbound emails create or attach to leads by matching addresses |
| **EM-03** | Send email replies from Atlas (from connected address) |
| **EM-04** | Thread view on lead record; basic HTML strip / sanitize for display |
| **EM-05** | Sync failure / token expiry alerts to admins |
| **EM-06** | Optional: CC/BCC and attachments (basic) if technically feasible within MVP timebox |

### 6.7 Website Chat Widget

| ID | Requirement |
|---|---|
| **CHAT-01** | Embeddable JavaScript widget for customer websites |
| **CHAT-02** | Configurable appearance: primary color, greeting, launcher position, brand name |
| **CHAT-03** | Visitor identifies with name + contact (email and/or phone) before or during chat |
| **CHAT-04** | Messages appear in Atlas inbox and create / update a lead |
| **CHAT-05** | Agent (or AI-assisted) replies appear in widget in real time or near real time |
| **CHAT-06** | Offline behavior: capture message + notify team; auto-ack if configured |
| **CHAT-07** | Domain allowlist for widget installation |

### 6.8 n8n Automation

| ID | Requirement |
|---|---|
| **N8N-01** | Atlas emits webhooks / events for key domain actions (e.g. lead.created, lead.stage_changed, message.received, message.sent) |
| **N8N-02** | Documented API / webhook payload schema for n8n workflows |
| **N8N-03** | Secure webhook signing / secrets for n8n connectivity |
| **N8N-04** | Ship starter workflow templates: lead assignment alert, after-hours acknowledgment, stage change notification, Slack/email notify (as available) |
| **N8N-05** | Admin UI to register outbound webhook endpoints and enable/disable them |
| **N8N-06** | Delivery logs / retry status for failed webhook calls (basic) |

> **Note:** MVP treats n8n as the **automation engine customers (or Atlas onboarding) configure**, not as a full visual builder inside Atlas. In-product workflow building is post-MVP.

### 6.9 Analytics

| ID | Requirement |
|---|---|
| **AN-01** | Date-range analytics for leads created, by source and channel |
| **AN-02** | First-response time distribution / average (business-hours optional stretch) |
| **AN-03** | Pipeline funnel: stage counts and stage conversion rates |
| **AN-04** | Message volume by channel |
| **AN-05** | AI assist usage: % of replies AI-drafted / accepted |
| **AN-06** | Per-agent activity basics: leads owned, replies sent (Admin/Owner view) |
| **AN-07** | Export summary CSV / download for a selected range |

### 6.10 Settings

| ID | Requirement |
|---|---|
| **SET-01** | Organization profile: name, logo, timezone, default language |
| **SET-02** | User management: invite, roles, deactivate |
| **SET-03** | Channel connections: WhatsApp, email, chat widget |
| **SET-04** | Pipeline stage configuration |
| **SET-05** | AI configuration: tone, knowledge snippets, reply policies |
| **SET-06** | Notification preferences (email / in-app for new lead, assignment, failed sync) |
| **SET-07** | Webhooks / n8n endpoint management |
| **SET-08** | Billing placeholder or simple plan display (if monetization in MVP); otherwise “Contact sales / early access” |
| **SET-09** | Audit-lite: last login / connection change stamps for admins |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement |
|---|---|
| **NFR-P01** | Core UI interactions (list/load lead detail) p95 &lt; 2s under expected MVP load |
| **NFR-P02** | Inbound message visible in inbox p95 &lt; 10s from provider webhook receipt |
| **NFR-P03** | AI draft generation p95 &lt; 8s for typical thread context |
| **NFR-P04** | Widget payload &lt; reasonable size for SMB sites; async load; no blocking main thread |

### 7.2 Reliability & Availability

| ID | Requirement |
|---|---|
| **NFR-R01** | Target uptime 99.5% monthly for app API (excluding third-party channel outages) |
| **NFR-R02** | Idempotent inbound webhook processing (no duplicate leads/messages on retry) |
| **NFR-R03** | Queue-based processing for channel events; retries with backoff |
| **NFR-R04** | Graceful degradation when AI provider is down (manual reply still works) |

### 7.3 Security & Privacy

| ID | Requirement |
|---|---|
| **NFR-S01** | Data encrypted in transit (TLS) and at rest |
| **NFR-S02** | Strict tenant isolation (row-level / org-scoped queries) |
| **NFR-S03** | Secrets (API tokens, OAuth refresh tokens) stored encrypted; never exposed to non-admins |
| **NFR-S04** | Role-based authorization on all mutating APIs |
| **NFR-S05** | Audit key security events: login failures, webhook secret rotation, role changes |
| **NFR-S06** | GDPR-aligned basics: data export per lead set, delete/anonymize request process |
| **NFR-S07** | Widget and web security: CSP-friendly embed, sanitize user-generated HTML |

### 7.4 Scalability (MVP posture)

| ID | Requirement |
|---|---|
| **NFR-SC01** | Support early customers at up to ~10k messages / org / month without redesign |
| **NFR-SC02** | Horizontal scale path for workers handling webhooks and AI jobs |

### 7.5 Usability & Accessibility

| ID | Requirement |
|---|---|
| **NFR-U01** | Usable by non-technical SMB staff with minimal training (&lt; 30 minutes for core flows) |
| **NFR-U02** | Responsive web app for desktop-first; usable tablet; mobile web secondary for MVP |
| **NFR-U03** | Clear empty states, error messages, and connection troubleshooting copy |
| **NFR-U04** | WCAG 2.1 AA target for primary flows where feasible |

### 7.6 Observability & Operations

| ID | Requirement |
|---|---|
| **NFR-O01** | Centralized application logging with request / tenant correlation IDs |
| **NFR-O02** | Alerts on webhook failure spikes, AI error rates, auth anomalies |
| **NFR-O03** | Feature flags for risky integrations |

### 7.7 Compliance & Third Parties

| ID | Requirement |
|---|---|
| **NFR-C01** | Explicit documentation of WhatsApp / Meta policy constraints affecting UX |
| **NFR-C02** | Email sending aligned with provider limits and anti-spam best practices |
| **NFR-C03** | AI provider data-handling disclosure in privacy policy |

---

## 8. Complete Feature List (MVP)

### A. Platform Foundation

- Multi-tenant organizations  
- Authentication (signup, login, password reset)  
- Team invites and roles (Owner/Admin, Agent, Viewer)  
- Organization settings (brand, timezone, language)  

### B. Dashboard

- KPI overview (leads, response time, open convos, conversions)  
- Pipeline snapshot  
- Channel mix snapshot  
- Guided empty states / onboarding cues  

### C. CRM

- Lead CRUD + archive  
- Standard fields + tags + notes  
- Configurable pipeline stages  
- Search, filter, sort  
- Activity timeline  
- Assignment  
- Duplicate assist (email/phone)  
- CSV import / export  
- Message-to-lead identity matching  

### D. Omnichannel Inbox / Communications

- Unified conversation view per lead  
- WhatsApp connect + send/receive  
- Email connect + send/receive  
- Website chat widget (embed + configure)  
- Channel health indicators  

### E. AI Lead Response

- Context-aware reply drafts  
- Human approval before send (default)  
- Tone / FAQ / policy configuration  
- Qualification prompts  
- Multilingual assist  
- AI usage logging  

### F. Automation (n8n)

- Domain event webhooks  
- Signed webhook secrets  
- Endpoint registration in Settings  
- Starter n8n workflow templates  
- Basic delivery/retry logs  

### G. Analytics

- Lead volume by source/channel  
- First-response time  
- Funnel / stage conversion  
- Message volume  
- AI assist rate  
- Agent activity basics  
- CSV export of summaries  

### H. Settings & Admin

- Users & roles  
- Channel connectors  
- AI settings  
- Pipeline settings  
- Notifications  
- Webhooks / n8n  
- Basic billing or plan display (as decided for launch monetization)  

### I. Supporting Experience

- In-app notifications for new leads / assignments  
- Help / docs links for channel setup  
- System status awareness for failed syncs  

---

## 9. Features Intentionally Excluded from the MVP

These are **out of scope** for MVP to protect time-to-market and clarity of the core value loop.

| Excluded area | Rationale |
|---|---|
| Native visual workflow builder (replace n8n) | n8n covers automation without rebuilding an engine |
| Fully autonomous AI auto-send (no human approval) as default | Trust, compliance, brand risk for SMB first launch |
| SMS / voice / Instagram / Messenger / LinkedIn as first-class channels | Focus WhatsApp + email + web chat |
| Native marketing automation / drip campaigns UI | Defer; use n8n for light follow-ups |
| Advanced lead scoring ML models | Start with stage + rules heuristics if needed later |
| Full marketing attribution (ads multi-touch, UTM warehouses) | Basic source field only |
| Quoting, invoicing, payments, e-signatures | Outside lead management MVP |
| Inventory / booking / calendar scheduling engine | Integrate later via n8n if needed |
| Mobile native apps (iOS/Android) | Responsive web first |
| Public marketplace of integrations | Curated connectors only |
| White-label / multi-brand agency portals | Post-MVP packaging |
| Advanced territory management / forecasting | Enterprise CRM territory |
| SSO / SAML enterprise IdP | Email/password + invites for MVP |
| Fine-grained custom object builder | Stick to leads + conversations + notes |
| Real-time collaborative presence / comments like Slack | Activity notes suffice |
| Multi-currency complex deal products / CPQ | Not ICP for MVP |
| On-prem or customer-managed VPC deployment | Cloud SaaS only |
| Conversation sentiment analysis as product feature | Optional later; not required for MVP KPI |
| A/B testing AI prompts productized UI | Engineering/ops config only |
| Customer self-serve knowledge base portal | Internal AI snippets only |

---

## 10. Success Criteria

Success is defined across **product validation**, **activation**, **engagement**, **reliability**, and **business** lenses.

### 10.1 Product Validation

| Criterion | Target (MVP window: launch → 90 days) |
|---|---|
| ICP interviews / design partners confirm problem-solution fit | ≥ 8 qualitative validations |
| Willingness to pay signal among activated orgs | ≥ 30% of activated orgs start paid / commit intent |
| NPS or equivalent CSAT among weekly active users | ≥ +30 NPS **or** ≥ 4.0/5 CSAT |

### 10.2 Activation & Time-to-Value

| Criterion | Target |
|---|---|
| Time from signup → first connected channel | Median &lt; 1 hour (guided) |
| Time from signup → first lead in CRM | Median &lt; 24 hours |
| Time from signup → first AI-assisted reply sent | Median &lt; 48 hours |
| Activation rate (connected channel + ≥5 leads touched) | ≥ 40% of signups within 14 days |

### 10.3 Engagement (Product-Market Fit Proxy)

| Criterion | Target (among activated orgs) |
|---|---|
| Weekly Active Orgs using inbox ≥1 day/week | ≥ 60% |
| Median first-response time improvement vs baseline (self-reported or pre-Atlas) | ≥ 40% reduction |
| AI draft acceptance rate (accepted / generated) | ≥ 35% after week 2 |
| Leads progressed ≥1 stage within 14 days of creation | ≥ 25% |

### 10.4 Reliability

| Criterion | Target |
|---|---|
| App uptime | ≥ 99.5% monthly |
| Failed inbound webhook rate (after retries) | &lt; 0.5% |
| Critical P0 incidents with data loss / cross-tenant leakage | **Zero** |
| Mean time to restore channel connection issues (P1) | &lt; 4 business hours (ops process) |

### 10.5 Business Outcomes (Early)

| Criterion | Target |
|---|---|
| Paying customers | Defined by GTM plan (e.g. 10–25 logos in first 90 days) |
| Logo churn (monthly, after first payment month) | &lt; 8% |
| Support burden | &lt; 2 actionable tickets / active org / week average |
| Feature adoption breadth | ≥ 70% of activated orgs use ≥2 of {WhatsApp, Email, Chat} **or** AI + CRM weekly |

### 10.6 Definition of Done for MVP Launch

MVP is **launch-ready** when all of the following are true:

1. All Must functional requirements in Section 6 are implemented for the listed core modules  
2. End-to-end happy path works in production: **widget/WhatsApp/email → lead CRM → AI draft → send → analytics register event → n8n webhook fires**  
3. Security tenant isolation tested (automated + manual penetration checklist)  
4. Onboarding documentation exists for channel setup and n8n templates  
5. Success instrumentation (events for activation funnel) is live  
6. Support runbooks exist for connector failures  

---

## Appendix A — MVP User Journeys (Summary)

1. **Admin connects channels** → Settings → WhatsApp / Email / Chat widget install  
2. **Lead arrives via WhatsApp** → Lead created → Agent notified → AI draft → Agent sends → Stage updated  
3. **Website visitor chats** → Widget → Lead + thread → After-hours auto-ack via n8n → Morning follow-up  
4. **Marketing reviews Analytics** → Sees which channel converts → Adjusts spend / widget placement  
5. **Ops adds automation** → Registers webhook → Imports Atlas starter template in n8n → Slack alert on `lead.created`

---

## Appendix B — Suggested Default Pipeline Stages

`New` → `Contacted` → `Qualified` → `Proposal` → `Won` → `Lost`

(Configurable in Settings; analytics depends on stage transitions.)

---

## Appendix C — Open Decisions (to resolve before build freeze)

| Decision | Options | Owner |
|---|---|---|
| WhatsApp provider path | Meta Cloud API direct vs BSP | Eng + Product |
| Email connectors | Google-only first vs Google + Microsoft | Eng |
| Monetization at MVP | Free beta vs paid from day 1 | Founders / GTM |
| AI model / vendor | Single provider vs abstraction | Eng |
| Human-in-the-loop hard rule | Always vs optional auto-send flag for trusted templates | Product / Legal |

---

## Document Approval

| Role | Name | Date | Signature |
|---|---|---|---|
| Product | | | |
| Engineering | | | |
| Design | | | |
| GTM | | | |

---

*End of MVP Specification — Project Atlas AI v1.0*
