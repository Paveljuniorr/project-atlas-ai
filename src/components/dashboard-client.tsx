"use client";

import Link from "next/link";
import {
  Users,
  TrendingUp,
  MessagesSquare,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Activity,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  pipelineValue: number;
  appointmentsUpcoming: number;
  aiConversations: number;
  messagesSent: number;
  messagesReceived: number;
  aiAcceptanceRate: number;
  automationSuccessRate: number;
  failedAutomations: number;
  leadSources: Record<string, number>;
  pipelineStages: Record<string, number>;
  topPerformingSources: { source: string; count: number }[];
  pendingFollowUps: { id: string; first_name?: string; last_name?: string; next_follow_up_at?: string }[];
  integrationStatus: { id: string; type: string; name: string; status: string; provider?: string }[];
  recentActivity: { id: string; action: string; summary: string; created_at: string }[];
  activeConversations: {
    id: string;
    channel: string;
    last_message_preview?: string;
    unread_count?: number;
    updated_at: string;
    lead?: { first_name?: string; last_name?: string; company_name?: string } | { first_name?: string; last_name?: string; company_name?: string }[];
  }[];
}

export function DashboardClient({
  metrics,
  error,
}: {
  metrics: DashboardMetrics | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Dashboard unavailable</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return <div className="animate-pulse h-64 rounded-2xl bg-slate-100" />;
  }

  const stageLabels: Record<string, string> = {
    new: "New Inbound Leads",
    contacted: "Contacted",
    qualified: "AI Qualified",
    proposal: "Proposal Sent",
    won: "Closed Won",
    lost: "Lost",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Dashboard</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60">
              Live Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Real-time metrics from your workspace database.</p>
        </div>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add New Lead
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Leads" value={metrics.totalLeads} icon={Users} sub={`${metrics.newLeads} new (30d)`} />
        <MetricCard label="Qualified Leads" value={metrics.qualifiedLeads} icon={TrendingUp} sub={`${metrics.conversionRate}% conversion`} />
        <MetricCard label="Messages" value={metrics.messagesReceived + metrics.messagesSent} icon={MessagesSquare} sub={`${metrics.messagesSent} sent`} />
        <MetricCard label="Upcoming Appointments" value={metrics.appointmentsUpcoming} icon={Calendar} sub={`AI acceptance ${metrics.aiAcceptanceRate}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Pipeline Stages</h2>
            <Link href="/leads" className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
              View CRM <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {Object.entries(metrics.pipelineStages).map(([stage, count]) => (
              <div key={stage} className="flex justify-between p-3 rounded-xl bg-slate-50 text-sm">
                <span>{stageLabels[stage] || stage}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(metrics.pipelineStages).length === 0 && (
              <p className="text-sm text-slate-500">No leads yet. Connect a channel or add a lead manually.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Integration Status</h2>
          <div className="space-y-2">
            {metrics.integrationStatus.length === 0 ? (
              <p className="text-sm text-slate-500">
                No integrations connected.{" "}
                <Link href="/settings" className="text-indigo-600 font-medium">Configure in Settings</Link>
              </p>
            ) : (
              metrics.integrationStatus.map((i) => (
                <div key={i.id} className="flex justify-between p-3 rounded-xl bg-slate-50 text-sm">
                  <span>{i.name} ({i.type})</span>
                  <StatusBadge status={i.status} />
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Active Conversations</h2>
            <Link href="/inbox" className="text-xs font-semibold text-indigo-600">Open Inbox →</Link>
          </div>
          {metrics.activeConversations.length === 0 ? (
            <p className="text-sm text-slate-500">No conversations yet.</p>
          ) : (
            metrics.activeConversations.map((c) => (
              <Link key={c.id} href="/inbox" className="block p-3 mb-2 rounded-xl border border-slate-100 hover:border-indigo-200">
                <div className="flex justify-between text-sm font-medium">
                  <span>{(() => {
                    const l = c.lead;
                    const lead = Array.isArray(l) ? l[0] : l;
                    return `${lead?.first_name || ""} ${lead?.last_name || ""}`.trim() || "Unknown";
                  })()}</span>
                  <span className="text-xs capitalize text-slate-400">{c.channel}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-1">{c.last_message_preview || "No messages"}</p>
              </Link>
            ))
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
          </div>
          {metrics.recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">Activity will appear as you use Atlas.</p>
          ) : (
            metrics.recentActivity.map((a) => (
              <div key={a.id} className="py-2 border-b border-slate-50 last:border-0 text-sm">
                <div className="font-medium text-slate-900">{a.action}</div>
                <div className="text-slate-600 text-xs">{a.summary}</div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-extrabold text-slate-900">{value.toLocaleString()}</div>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    connected: "bg-emerald-100 text-emerald-800",
    error: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
    disconnected: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}
