"use client";

import { useState, useEffect } from "react";
import { 
  Building, 
  Users, 
  Key, 
  Webhook, 
  Bot, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Plus, 
  Trash2, 
  ExternalLink,
  Shield,
  Sparkles,
  RefreshCw,
  Mail,
  MessageSquare,
  Calendar,
  Layers
} from "lucide-react";

interface Integration {
  id: string;
  type: string;
  name: string;
  status: "connected" | "disconnected" | "error" | "pending";
  provider?: string;
  health?: { status: string };
}

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  status: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Settings state
  const [companyName, setCompanyName] = useState("Atlas AI Workspace");
  const [timezone, setTimezone] = useState("UTC");
  const [aiTone, setAiTone] = useState<"professional" | "friendly" | "persuasive" | "concise">("professional");
  const [humanInTheLoop, setHumanInTheLoop] = useState(true);
  const [autoReply, setAutoReply] = useState(false);

  // Integrations state
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [credentialsInput, setCredentialsInput] = useState<Record<string, string>>({});

  // Team state
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Sales");

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    if (activeTab === "integrations") fetchIntegrations();
    if (activeTab === "team") fetchTeam();
    if (activeTab === "api-keys" || activeTab === "integrations") fetchApiKeys();
  }, [activeTab]);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/v1/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setCompanyName(json.data.name || "Atlas AI Workspace");
        setTimezone(json.data.timezone || "UTC");
        if (json.data.ai_settings) {
          setAiTone(json.data.ai_settings.tone || "professional");
          setHumanInTheLoop(json.data.ai_settings.humanInTheLoop ?? true);
          setAutoReply(json.data.ai_settings.autoReply ?? false);
        }
      }
    } catch {
      // fallback to initial state
    }
  }

  async function fetchIntegrations() {
    try {
      const res = await fetch("/api/v1/integrations");
      const json = await res.json();
      if (json.success) setIntegrations(json.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchTeam() {
    try {
      const res = await fetch("/api/v1/team");
      const json = await res.json();
      if (json.success) setTeam(json.data.members || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchApiKeys() {
    try {
      const res = await fetch("/api/v1/api-keys");
      const json = await res.json();
      if (json.success) setApiKeys(json.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveSettings() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          timezone,
          aiSettings: {
            tone: aiTone,
            humanInTheLoop,
            autoReply,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to save settings" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save settings" });
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectIntegration(type: string, provider: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          provider,
          name: `${provider.toUpperCase()} Integration`,
          credentials: credentialsInput,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: `${provider} connected successfully!` });
        setConnectModal(null);
        setCredentialsInput({});
        fetchIntegrations();
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to connect integration" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to connect" });
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteMember() {
    if (!inviteEmail) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: `Invitation sent to ${inviteEmail}` });
        setInviteEmail("");
        fetchTeam();
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to invite" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateApiKey() {
    if (!newKeyName) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          scopes: ["leads:read", "leads:create", "inbox:read", "inbox:write"],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedKey(json.data.secretKey);
        setNewKeyName("");
        fetchApiKeys();
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to create API key" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeApiKey(keyId: string) {
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    try {
      await fetch(`/api/v1/api-keys?id=${keyId}`, { method: "DELETE" });
      fetchApiKeys();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings & Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">Manage organization defaults, integrations, AI tone, and team security.</p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
            {message.type === "success" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            {message.text}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
        {/* Navigation Sidebar */}
        <div className="w-64 border-r border-slate-100 p-4 space-y-1 bg-slate-50/50">
          {[
            { id: "general", label: "General & AI", icon: Building },
            { id: "integrations", label: "Integrations", icon: Layers },
            { id: "team", label: "Team & RBAC", icon: Users },
            { id: "api-keys", label: "API Keys", icon: Key },
            { id: "billing", label: "Plan & Billing", icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <tab.icon className={`size-4 ${activeTab === tab.id ? "text-white" : "text-slate-400"}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === "general" && (
            <div className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">General Workspace</h2>
                <p className="text-sm text-slate-500 mb-6">Basic business profile and localization.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-sm"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">EST (Eastern Standard Time)</option>
                      <option value="America/Los_Angeles">PST (Pacific Standard Time)</option>
                      <option value="Europe/London">GMT / BST (London)</option>
                      <option value="Asia/Tokyo">JST (Tokyo)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="size-4 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">AI Revenue Assistant</h2>
                </div>
                <p className="text-sm text-slate-500 mb-6">Configure how Atlas AI crafts draft responses and handles leads.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">AI Communication Tone</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value as any)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 text-sm"
                    >
                      <option value="professional">Professional & Direct</option>
                      <option value="friendly">Warm & Consultative</option>
                      <option value="persuasive">High-Conversion / Sales-Focused</option>
                      <option value="concise">Concise & Minimal</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div>
                      <div className="font-medium text-sm text-slate-900">Human-In-The-Loop Verification</div>
                      <div className="text-xs text-slate-500">Require sales agents to approve or edit AI drafts before sending.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={humanInTheLoop}
                      onChange={(e) => setHumanInTheLoop(e.target.checked)}
                      className="size-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div>
                      <div className="font-medium text-sm text-slate-900">Autonomous Instant Replies</div>
                      <div className="text-xs text-slate-500">Automatically reply to new leads on WhatsApp & Email when confident.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoReply}
                      onChange={(e) => setAutoReply(e.target.checked)}
                      className="size-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="size-4 animate-spin" /> : null}
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Integration Providers</h2>
                <p className="text-sm text-slate-500">Connect communication channels and calendars via clean provider abstractions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    type: "whatsapp",
                    provider: "whatsapp_cloud",
                    title: "WhatsApp Cloud API",
                    desc: "Meta official API for WhatsApp Business messaging and lead qualification.",
                    icon: MessageSquare,
                  },
                  {
                    type: "whatsapp",
                    provider: "twilio",
                    title: "Twilio WhatsApp / SMS",
                    desc: "Twilio Programmable Messaging adapter for omnichannel SMS & WhatsApp.",
                    icon: MessageSquare,
                  },
                  {
                    type: "email",
                    provider: "resend",
                    title: "Resend Email",
                    desc: "High-deliverability transactional & inbound email threads.",
                    icon: Mail,
                  },
                  {
                    type: "google_calendar",
                    provider: "google_calendar",
                    title: "Google Calendar",
                    desc: "Real-time calendar slot checking and automated meeting bookings.",
                    icon: Calendar,
                  },
                  {
                    type: "n8n",
                    provider: "n8n",
                    title: "n8n Automation Engine",
                    desc: "Trigger custom workflows on lead capture, stage change, and bookings.",
                    icon: Webhook,
                  },
                ].map((item) => {
                  const existing = integrations.find((i) => i.type === item.type && i.provider === item.provider);
                  const isConnected = existing?.status === "connected";

                  return (
                    <div key={item.provider} className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-white flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                              <item.icon className="size-5" />
                            </div>
                            <span className="font-semibold text-slate-900 text-sm">{item.title}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isConnected ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"}`}>
                            {isConnected ? "Connected" : "Not Connected"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono">Provider: {item.provider}</span>
                        <button
                          onClick={() => setConnectModal(item.provider)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                        >
                          {isConnected ? "Reconfigure" : "Connect"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connect Modal */}
              {connectModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Connect {connectModal}</h3>
                    <p className="text-xs text-slate-500 mb-4">Credentials are encrypted with AES-256-GCM and never exposed to the frontend.</p>

                    {connectModal === "twilio" && (
                      <div className="space-y-3 mb-6">
                        <input
                          type="text"
                          placeholder="Account SID"
                          onChange={(e) => setCredentialsInput({ ...credentialsInput, accountSid: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-sm"
                        />
                        <input
                          type="password"
                          placeholder="Auth Token"
                          onChange={(e) => setCredentialsInput({ ...credentialsInput, authToken: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-sm"
                        />
                        <input
                          type="text"
                          placeholder="From Number (e.g. +14155238886)"
                          onChange={(e) => setCredentialsInput({ ...credentialsInput, fromNumber: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-sm"
                        />
                      </div>
                    )}

                    {connectModal === "whatsapp_cloud" && (
                      <div className="space-y-3 mb-6">
                        <input
                          type="password"
                          placeholder="Meta Access Token"
                          onChange={(e) => setCredentialsInput({ ...credentialsInput, accessToken: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Phone Number ID"
                          onChange={(e) => setCredentialsInput({ ...credentialsInput, phoneNumberId: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-sm"
                        />
                      </div>
                    )}

                    {connectModal === "resend" && (
                      <div className="space-y-3 mb-6">
                        <input
                          type="password"
                          placeholder="Resend API Key (re_...)"
                          onChange={(e) => setCredentialsInput({ ...credentialsInput, apiKey: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-sm"
                        />
                        <input
                          type="email"
                          placeholder="Sender Email (e.g. team@yourdomain.com)"
                          onChange={(e) => setCredentialsInput({ ...credentialsInput, fromEmail: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-sm"
                        />
                      </div>
                    )}

                    {connectModal === "n8n" && (
                      <div className="space-y-3 mb-6">
                        <input
                          type="text"
                          placeholder="n8n Webhook URL"
                          onChange={(e) => setCredentialsInput({ ...credentialsInput, webhookUrl: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-sm"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setConnectModal(null); setCredentialsInput({}); }}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConnectIntegration("whatsapp", connectModal)}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        {loading ? "Validating..." : "Save & Verify"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Team & Permissions</h2>
                  <p className="text-sm text-slate-500">Manage member roles and tenant authorization.</p>
                </div>
              </div>

              {/* Invite Form */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex gap-3 items-center">
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none"
                >
                  <option value="Owner">Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="Member">Member</option>
                </select>
                <button
                  onClick={handleInviteMember}
                  disabled={loading || !inviteEmail}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Invite
                </button>
              </div>

              {/* Member List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 font-medium">User</th>
                      <th className="p-3.5 font-medium">Role</th>
                      <th className="p-3.5 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {team.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5">
                          <div className="font-medium text-slate-900">{member.name || member.email}</div>
                          <div className="text-xs text-slate-400">{member.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                            {member.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-emerald-600 font-medium">
                          {member.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "api-keys" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Organization API Keys</h2>
                <p className="text-sm text-slate-500">Programmatically ingest leads and access conversation streams.</p>
              </div>

              {generatedKey && (
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900">
                  <div className="font-semibold text-sm mb-1">Copy Your Secret Key Now</div>
                  <p className="text-xs mb-3 text-amber-700">For security reasons, this key will never be shown again.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white p-2 rounded-lg border border-amber-200 font-mono text-xs select-all">
                      {generatedKey}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedKey)}
                      className="px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 flex items-center gap-1"
                    >
                      <Copy className="size-3.5" /> Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Create Key Form */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="e.g. Website Form Lead Ingest"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleCreateApiKey}
                  disabled={loading || !newKeyName}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <Plus className="size-4" /> Generate Key
                </button>
              </div>

              {/* Key List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 font-medium">Key Name</th>
                      <th className="p-3.5 font-medium">Prefix</th>
                      <th className="p-3.5 font-medium">Scopes</th>
                      <th className="p-3.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {apiKeys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-medium text-slate-900">{k.name}</td>
                        <td className="p-3.5 font-mono text-xs text-slate-600">{k.key_prefix}...</td>
                        <td className="p-3.5">
                          <div className="flex gap-1 flex-wrap">
                            {k.scopes.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleRevokeApiKey(k.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Revoke Key"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Plan & Billing</h2>
                <p className="text-sm text-slate-500">Manage subscriptions, seat allocation, and AI usage quotas.</p>
              </div>

              <div className="p-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                      PRO ENTERPRISE
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">$199 / month</h3>
                  </div>
                  <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors">
                    Manage Stripe Portal
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-indigo-100 text-xs">
                  <div>
                    <span className="text-slate-500">Active Leads</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">Unlimited</p>
                  </div>
                  <div>
                    <span className="text-slate-500">AI Response Drafts</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">25,000 / mo</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Team Seats</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">15 Included</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
