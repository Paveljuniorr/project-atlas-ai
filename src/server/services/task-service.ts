import { createServerServiceClient } from "@/server/db/client";
import { emitEvent, writeAuditLog } from "@/server/events/event-bus";
import type { UserContext } from "@/server/auth/context";

export async function listTasks(orgId: string, options: { done?: boolean; priority?: string } = {}) {
  const supabase = createServerServiceClient();
  let query = supabase
    .from("tasks")
    .select("*, user:users(first_name, last_name, email)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (typeof options.done === "boolean") {
    query = query.eq("done", options.done);
  }
  if (options.priority) {
    query = query.eq("priority", options.priority);
  }

  const { data, error } = await query;
  if (error) throw new Error("Failed to fetch tasks");
  return data ?? [];
}

export async function createTaskRecord(
  ctx: UserContext,
  input: {
    text: string;
    priority?: "High" | "Medium" | "Low";
    lead?: string;
    leadId?: string;
    dueDate?: string;
  }
) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      org_id: ctx.orgId,
      user_id: ctx.userId !== "public" ? ctx.userId : null,
      text: input.text,
      priority: input.priority ?? "Medium",
      lead: input.lead ?? null,
      lead_id: input.leadId ?? null,
      due_date: input.dueDate ? new Date(input.dueDate).toISOString() : null,
      done: false,
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create task");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "task.created",
    entityType: "task",
    entityId: data.id,
    summary: `Task created: ${input.text}`,
  });

  return data;
}

export async function toggleTaskStatus(ctx: UserContext, taskId: string) {
  const supabase = createServerServiceClient();

  const { data: existing, error: findError } = await supabase
    .from("tasks")
    .select("id, done, text")
    .eq("id", taskId)
    .eq("org_id", ctx.orgId)
    .single();

  if (findError || !existing) throw new Error("NOT_FOUND: Task not found");

  const newStatus = !existing.done;
  const { data, error } = await supabase
    .from("tasks")
    .update({ done: newStatus, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("org_id", ctx.orgId)
    .select()
    .single();

  if (error) throw new Error("Failed to update task");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "task.updated",
    entityType: "task",
    entityId: taskId,
    summary: `Task marked as ${newStatus ? "completed" : "pending"}: ${existing.text}`,
  });

  return data;
}

export async function deleteTaskRecord(ctx: UserContext, taskId: string) {
  const supabase = createServerServiceClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("org_id", ctx.orgId);

  if (error) throw new Error("NOT_FOUND: Task not found");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "task.deleted",
    entityType: "task",
    entityId: taskId,
    summary: "Task deleted",
  });
}
