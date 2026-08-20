import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { createServerServiceClient } from "@/server/db/client";
import { encryptCredentials } from "@/server/security/crypto";
import { emitEvent, writeAuditLog } from "@/server/events/event-bus";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

export async function GET() {
  try {
    const ctx = await getUserContext("integrations:manage");
    const supabase = createServerServiceClient();
    const { data } = await supabase
      .from("integrations")
      .select("id, type, name, status, health, provider, config, created_at, updated_at")
      .eq("org_id", ctx.orgId);
    return apiSuccess(data ?? []);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

const connectSchema = z.object({
  type: z.enum(["whatsapp", "email", "chat_widget", "google_calendar", "n8n"]),
  provider: z.string(),
  name: z.string().min(1),
  credentials: z.record(z.string(), z.string()),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext("integrations:manage");
    const body = connectSchema.parse(await req.json());

    const { createMessagingProvider } = await import("@/server/integrations/providers");
    const provider = createMessagingProvider(body.provider, body.credentials);
    const valid = await provider.validateCredentials();
    if (!valid) {
      return mapErrorToResponse(new Error("VALIDATION: Invalid integration credentials"));
    }

    const { config } = await provider.connect();
    const supabase = createServerServiceClient();

    const { data: existing } = await supabase
      .from("integrations")
      .select("id")
      .eq("org_id", ctx.orgId)
      .eq("type", body.type)
      .maybeSingle();

    const payload = {
      org_id: ctx.orgId,
      type: body.type,
      provider: body.provider,
      name: body.name,
      status: "connected",
      config: { ...config, ...(body.config || {}), provider: body.provider },
      credentials_ciphertext: encryptCredentials(JSON.stringify(body.credentials)),
      connected_by_id: ctx.userId,
      health: { status: "healthy", lastCheckedAt: new Date().toISOString() },
    };

    const { data, error } = existing
      ? await supabase.from("integrations").update(payload).eq("id", existing.id).select("id, type, name, status, health, provider, config").single()
      : await supabase.from("integrations").insert(payload).select("id, type, name, status, health, provider, config").single();

    if (error) throw new Error("Failed to save integration");

    await emitEvent("integration.connected", ctx.orgId, { integrationId: data.id, type: body.type });
    await writeAuditLog({
      orgId: ctx.orgId,
      actorUserId: ctx.userId,
      action: "integration.connected",
      entityType: "integration",
      entityId: data.id,
      summary: `${body.type} integration connected (${body.provider})`,
    });

    return apiSuccess(data, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
