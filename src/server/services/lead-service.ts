import { createServerServiceClient } from "@/server/db/client";
import { emitEvent, writeAuditLog } from "@/server/events/event-bus";
import type { UserContext } from "@/server/auth/context";

export async function listLeads(
  orgId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    stageId?: string;
    ownerId?: string;
    source?: string;
    sort?: string;
  } = {}
) {
  const supabase = createServerServiceClient();
  const page = options.page ?? 1;
  const limit = Math.min(options.limit ?? 25, 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("org_id", orgId)
    .eq("status", "active");

  if (options.stageId) query = query.eq("stage_id", options.stageId);
  if (options.ownerId) query = query.eq("owner_id", options.ownerId);
  if (options.source) query = query.eq("source", options.source);
  if (options.search) {
    query = query.or(
      `first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%,company_name.ilike.%${options.search}%`
    );
  }

  const sortField = options.sort?.replace(/^-/, "") || "created_at";
  const ascending = !options.sort?.startsWith("-");
  query = query.order(sortField, { ascending }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error("Failed to fetch leads");
  return { leads: data ?? [], total: count ?? 0, page, limit };
}

export async function createLeadRecord(
  ctx: UserContext,
  input: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    source?: string;
    stage_id?: string;
    notes?: string;
    owner_id?: string;
  }
) {
  const supabase = createServerServiceClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      org_id: ctx.orgId,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      phone: input.phone,
      company_name: input.company_name,
      source: input.source ?? "manual",
      stage_id: input.stage_id ?? "new",
      notes: input.notes,
      owner_id: input.owner_id ?? (ctx.userId !== "public" ? ctx.userId : null),
      status: "active",
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create lead");

  await emitEvent("lead.created", ctx.orgId, { leadId: lead.id, source: lead.source });
  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "lead.created",
    entityType: "lead",
    entityId: lead.id,
    summary: `Lead created: ${input.first_name || input.email || "Unknown"}`,
  });

  return lead;
}

export async function updateLeadRecord(
  ctx: UserContext,
  leadId: string,
  updates: Record<string, unknown>
) {
  const supabase = createServerServiceClient();
  const allowed = [
    "first_name", "last_name", "email", "phone", "company_name",
    "source", "stage_id", "notes", "owner_id", "score", "intent",
    "next_follow_up_at", "tags", "custom_fields", "metadata",
  ];
  const payload: Record<string, unknown> = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) payload[key] = updates[key];
  }

  const { data, error } = await supabase
    .from("leads")
    .update(payload)
    .eq("id", leadId)
    .eq("org_id", ctx.orgId)
    .select()
    .single();

  if (error || !data) throw new Error("NOT_FOUND: Lead not found");

  if (updates.stage_id) {
    await emitEvent("lead.stage_changed", ctx.orgId, {
      leadId,
      stageId: updates.stage_id,
    });
  }
  if (updates.owner_id) {
    await emitEvent("lead.assigned", ctx.orgId, { leadId, ownerId: updates.owner_id });
  }

  await emitEvent("lead.updated", ctx.orgId, { leadId });
  return data;
}

export async function archiveLead(ctx: UserContext, leadId: string) {
  const supabase = createServerServiceClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: "archived" })
    .eq("id", leadId)
    .eq("org_id", ctx.orgId);
  if (error) throw new Error("NOT_FOUND: Lead not found");
  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "lead.archived",
    entityType: "lead",
    entityId: leadId,
    summary: "Lead archived",
  });
}

export async function getLeadActivity(orgId: string, leadId: string) {
  const supabase = createServerServiceClient();

  const [{ data: audit }, { data: messages }] = await Promise.all([
    supabase
      .from("audit_logs")
      .select("*")
      .eq("org_id", orgId)
      .eq("entity_id", leadId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("messages")
      .select("id, body, direction, channel, created_at, sender_type")
      .eq("org_id", orgId)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return { audit: audit ?? [], messages: messages ?? [] };
}
