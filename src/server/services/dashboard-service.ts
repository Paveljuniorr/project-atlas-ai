import { createServerServiceClient } from "@/server/db/client";

export async function getDashboardMetrics(orgId: string) {
  const supabase = createServerServiceClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalLeads },
    { count: newLeads },
    { count: qualifiedLeads },
    { count: wonLeads },
    { count: messagesSent },
    { count: messagesReceived },
    { count: aiDrafts },
    { count: aiAccepted },
    { count: upcomingAppointments },
    { count: failedAutomations },
    { data: integrations },
    { data: recentActivity },
    { data: leadsBySource },
    { data: pipelineStages },
    { data: recentConversations },
    { data: pendingFollowUps },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("status", "active"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("org_id", orgId).gte("created_at", thirtyDaysAgo),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("stage_id", "qualified"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("stage_id", "won"),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("direction", "outbound"),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("direction", "inbound"),
    supabase.from("ai_responses").select("*", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("ai_responses").select("*", { count: "exact", head: true }).eq("org_id", orgId).in("status", ["accepted", "edited"]),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("org_id", orgId).gte("starts_at", now.toISOString()).in("status", ["scheduled", "confirmed"]),
    supabase.from("webhook_deliveries").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("status", "failed"),
    supabase.from("integrations").select("id, type, name, status, health, provider").eq("org_id", orgId),
    supabase.from("audit_logs").select("*").eq("org_id", orgId).order("created_at", { ascending: false }).limit(10),
    supabase.from("leads").select("source").eq("org_id", orgId).eq("status", "active"),
    supabase.from("leads").select("stage_id").eq("org_id", orgId).eq("status", "active"),
    supabase
      .from("conversations")
      .select("id, channel, last_message_preview, unread_count, updated_at, lead:leads(first_name, last_name, company_name)")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("leads")
      .select("id, first_name, last_name, next_follow_up_at")
      .eq("org_id", orgId)
      .eq("status", "active")
      .not("next_follow_up_at", "is", null)
      .lte("next_follow_up_at", new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10),
  ]);

  const sourceCounts: Record<string, number> = {};
  for (const row of leadsBySource ?? []) {
    const s = row.source || "other";
    sourceCounts[s] = (sourceCounts[s] || 0) + 1;
  }

  const stageCounts: Record<string, number> = {};
  for (const row of pipelineStages ?? []) {
    const s = row.stage_id || "new";
    stageCounts[s] = (stageCounts[s] || 0) + 1;
  }

  const conversionRate =
    totalLeads && wonLeads ? Math.round(((wonLeads ?? 0) / (totalLeads ?? 1)) * 1000) / 10 : 0;

  const aiAcceptanceRate =
    aiDrafts && aiAccepted ? Math.round(((aiAccepted ?? 0) / (aiDrafts ?? 1)) * 1000) / 10 : 0;

  const automationSuccessRate =
    failedAutomations !== null
      ? Math.max(0, 100 - (failedAutomations ?? 0) * 5)
      : 100;

  return {
    totalLeads: totalLeads ?? 0,
    newLeads: newLeads ?? 0,
    qualifiedLeads: qualifiedLeads ?? 0,
    conversionRate,
    pipelineValue: (qualifiedLeads ?? 0) * 5000,
    appointments: upcomingAppointments ?? 0,
    appointmentsUpcoming: upcomingAppointments ?? 0,
    aiConversations: aiDrafts ?? 0,
    messagesSent: messagesSent ?? 0,
    messagesReceived: messagesReceived ?? 0,
    responseTimeMs: null,
    leadSources: sourceCounts,
    automationSuccessRate,
    recentActivity: recentActivity ?? [],
    topPerformingSources: Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count })),
    pendingFollowUps: pendingFollowUps ?? [],
    failedAutomations: failedAutomations ?? 0,
    integrationStatus: integrations ?? [],
    pipelineStages: stageCounts,
    activeConversations: recentConversations ?? [],
    aiAcceptanceRate,
  };
}
