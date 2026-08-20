import { createServerServiceClient } from "@/server/db/client";
import { writeAuditLog } from "@/server/events/event-bus";
import type { UserContext } from "@/server/auth/context";

export async function getOrganizationSettings(orgId: string) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, logo_url, timezone, default_language, ai_settings, pipeline_stages, status, created_at")
    .eq("id", orgId)
    .single();

  if (error || !data) throw new Error("NOT_FOUND: Organization not found");
  return data;
}

export async function updateOrganizationSettings(
  ctx: UserContext,
  updates: {
    name?: string;
    timezone?: string;
    defaultLanguage?: string;
    aiSettings?: {
      tone?: "professional" | "friendly" | "persuasive" | "concise";
      humanInTheLoop?: boolean;
      autoReply?: boolean;
      bookingPrompt?: string;
    };
    pipelineStages?: Array<{ id: string; name: string; order: number; isTerminal?: boolean }>;
  }
) {
  const supabase = createServerServiceClient();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name) payload.name = updates.name;
  if (updates.timezone) payload.timezone = updates.timezone;
  if (updates.defaultLanguage) payload.default_language = updates.defaultLanguage;
  if (updates.aiSettings) payload.ai_settings = updates.aiSettings;
  if (updates.pipelineStages) payload.pipeline_stages = updates.pipelineStages;

  const { data, error } = await supabase
    .from("organizations")
    .update(payload)
    .eq("id", ctx.orgId)
    .select()
    .single();

  if (error || !data) throw new Error("Failed to update organization settings");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "settings.updated",
    entityType: "organization",
    entityId: ctx.orgId,
    summary: "Organization settings updated",
  });

  return data;
}
