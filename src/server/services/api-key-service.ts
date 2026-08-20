import { createServerServiceClient } from "@/server/db/client";
import { generateApiKey, hashSecret } from "@/server/security/crypto";
import { writeAuditLog } from "@/server/events/event-bus";
import type { UserContext } from "@/server/auth/context";

export async function listApiKeys(orgId: string) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, scopes, status, expires_at, last_used_at, created_at, revoked_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch API keys");
  return data ?? [];
}

export async function createApiKeyRecord(
  ctx: UserContext,
  input: {
    name: string;
    scopes: string[];
    expiresInDays?: number;
  }
) {
  const supabase = createServerServiceClient();
  const { raw, prefix, hash } = generateApiKey();

  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      org_id: ctx.orgId,
      name: input.name,
      key_prefix: prefix,
      key_hash: hash,
      scopes: input.scopes,
      status: "active",
      expires_at: expiresAt,
      created_by_id: ctx.userId,
    })
    .select("id, name, key_prefix, scopes, status, expires_at, created_at")
    .single();

  if (error) throw new Error("Failed to create API key");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "api_key.created",
    entityType: "api_key",
    entityId: data.id,
    summary: `API Key '${input.name}' created with prefix ${prefix}...`,
  });

  return {
    apiKey: data,
    secretKey: raw, // Showed once to user
  };
}

export async function revokeApiKey(ctx: UserContext, keyId: string) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("api_keys")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("id", keyId)
    .eq("org_id", ctx.orgId)
    .select("id, name, key_prefix")
    .single();

  if (error || !data) throw new Error("NOT_FOUND: API key not found");

  await writeAuditLog({
    orgId: ctx.orgId,
    actorUserId: ctx.userId,
    action: "api_key.revoked",
    entityType: "api_key",
    entityId: keyId,
    summary: `API Key '${data.name}' (${data.key_prefix}...) revoked`,
  });

  return data;
}
