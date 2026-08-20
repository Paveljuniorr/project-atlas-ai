import { createServerServiceClient } from "@/server/db/client";
import { writeAuditLog } from "@/server/events/event-bus";
import type { UserContext } from "@/server/auth/context";

export async function listKnowledgeBase(orgId: string) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch knowledge base articles");
  return data ?? [];
}

export async function createKnowledgeBaseEntry(
  ctx: UserContext,
  input: {
    title: string;
    content: string;
    tags?: string[];
  }
) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("knowledge_base")
    .insert({
      org_id: ctx.orgId,
      title: input.title,
      content: input.content,
      tags: input.tags ?? [],
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create knowledge base entry");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "knowledge_base.created",
    entityType: "knowledge_base",
    entityId: data.id,
    summary: `Added knowledge base article: ${input.title}`,
  });

  return data;
}

export async function updateKnowledgeBaseEntry(
  ctx: UserContext,
  entryId: string,
  input: {
    title?: string;
    content?: string;
    tags?: string[];
    isActive?: boolean;
  }
) {
  const supabase = createServerServiceClient();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) payload.title = input.title;
  if (input.content !== undefined) payload.content = input.content;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  const { data, error } = await supabase
    .from("knowledge_base")
    .update(payload)
    .eq("id", entryId)
    .eq("org_id", ctx.orgId)
    .select()
    .single();

  if (error || !data) throw new Error("NOT_FOUND: Knowledge base article not found");
  return data;
}

export async function deleteKnowledgeBaseEntry(ctx: UserContext, entryId: string) {
  const supabase = createServerServiceClient();
  const { error } = await supabase
    .from("knowledge_base")
    .delete()
    .eq("id", entryId)
    .eq("org_id", ctx.orgId);

  if (error) throw new Error("NOT_FOUND: Knowledge base article not found");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "knowledge_base.deleted",
    entityType: "knowledge_base",
    entityId: entryId,
    summary: `Deleted knowledge base article ${entryId}`,
  });

  return { success: true };
}
