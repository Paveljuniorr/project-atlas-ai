import { createServerServiceClient } from "@/server/db/client";
import { decryptCredentials } from "@/server/security/crypto";
import { createMessagingProvider } from "./providers";
import type { MessagingProvider, SendMessageParams, SendMessageResult } from "./types";

export async function getIntegrationProvider(
  orgId: string,
  type: string,
  channel?: string
): Promise<{ integrationId: string; provider: MessagingProvider } | null> {
  const supabase = createServerServiceClient();
  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("org_id", orgId)
    .eq("type", type)
    .eq("status", "connected")
    .maybeSingle();

  if (!integration) return null;

  const providerId = integration.provider || integration.config?.provider || "twilio";
  let credentials: Record<string, string> = {};

  if (integration.credentials_ciphertext) {
    try {
      credentials = JSON.parse(decryptCredentials(integration.credentials_ciphertext));
    } catch {
      return null;
    }
  } else if (integration.config?.credentials) {
    credentials = integration.config.credentials;
  }

  const provider = createMessagingProvider(providerId, credentials);
  return { integrationId: integration.id, provider };
}

export async function sendViaIntegration(
  orgId: string,
  type: string,
  params: Omit<SendMessageParams, "orgId" | "integrationId"> & { integrationId?: string }
): Promise<SendMessageResult> {
  const resolved = await getIntegrationProvider(orgId, type);
  if (!resolved) {
    return { status: "failed", errorMessage: "No connected integration found" };
  }
  return resolved.provider.sendMessage({
    ...params,
    orgId,
    integrationId: params.integrationId || resolved.integrationId,
  });
}
