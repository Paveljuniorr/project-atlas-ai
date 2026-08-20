import { createServerServiceClient } from "@/server/db/client";
import { signWebhookPayload } from "@/server/security/crypto";
import { logger } from "@/lib/logger";
import type { DomainEvent } from "@/server/events/types";
import { randomUUID } from "crypto";

const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [0, 60_000, 300_000, 1_800_000, 7_200_000];

export async function dispatchAutomationWebhooks(event: DomainEvent) {
  const supabase = createServerServiceClient();

  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .eq("org_id", event.orgId)
    .in("status", ["enabled", "active"])
    .contains("subscribed_events", [event.type]);

  if (!automations?.length) return;

  for (const automation of automations) {
    const eventId = `${event.id}_${automation.id}`;
    const payload = {
      id: event.id,
      type: event.type,
      createdAt: event.createdAt,
      companyId: event.orgId,
      data: event.data,
    };
    const payloadStr = JSON.stringify(payload);

    await supabase.from("webhook_deliveries").insert({
      org_id: event.orgId,
      automation_id: automation.id,
      event_type: event.type,
      event_id: eventId,
      payload,
      status: "pending",
      attempt: 1,
    });

    await deliverWebhook({
      orgId: event.orgId,
      automationId: automation.id,
      eventId,
      url: automation.endpoint_url,
      payloadStr,
      secretHash: automation.secret_hash,
      attempt: 1,
    });
  }
}

async function deliverWebhook(params: {
  orgId: string;
  automationId: string;
  eventId: string;
  url: string;
  payloadStr: string;
  secretHash?: string;
  attempt: number;
}) {
  const supabase = createServerServiceClient();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = params.secretHash
    ? signWebhookPayload(`${timestamp}.${params.payloadStr}`, params.secretHash)
    : "";

  const start = Date.now();
  try {
    const res = await fetch(params.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Atlas-Event": JSON.parse(params.payloadStr).type,
        "X-Atlas-Delivery": params.eventId,
        "X-Atlas-Timestamp": timestamp,
        ...(signature ? { "X-Atlas-Signature": `sha256=${signature}` } : {}),
      },
      body: params.payloadStr,
      signal: AbortSignal.timeout(15_000),
    });

    const responseBody = (await res.text()).substring(0, 2048);
    const durationMs = Date.now() - start;

    await supabase
      .from("webhook_deliveries")
      .update({
        status: res.ok ? "success" : "failed",
        http_status: res.status,
        response_body: responseBody,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
        error_message: res.ok ? null : `HTTP ${res.status}`,
      })
      .eq("event_id", params.eventId);

    if (!res.ok && params.attempt < MAX_ATTEMPTS) {
      await scheduleRetry(params, params.attempt + 1);
    }
  } catch (err: any) {
    logger.error("webhook_delivery_failed", err, { eventId: params.eventId });
    await supabase
      .from("webhook_deliveries")
      .update({
        status: "failed",
        error_message: err.message,
        completed_at: new Date().toISOString(),
      })
      .eq("event_id", params.eventId);

    if (params.attempt < MAX_ATTEMPTS) {
      await scheduleRetry(params, params.attempt + 1);
    }
  }
}

async function scheduleRetry(
  params: {
    orgId: string;
    automationId: string;
    eventId: string;
    url: string;
    payloadStr: string;
    secretHash?: string;
    attempt: number;
  },
  nextAttempt: number
) {
  const supabase = createServerServiceClient();
  const nextRetryAt = new Date(Date.now() + BACKOFF_MS[nextAttempt - 1] || 7_200_000);

  await supabase
    .from("webhook_deliveries")
    .update({
      status: "retrying",
      attempt: nextAttempt,
      next_retry_at: nextRetryAt.toISOString(),
    })
    .eq("event_id", params.eventId);

  // MVP: fire-and-forget delayed retry (production: use job queue)
  setTimeout(() => {
    deliverWebhook({ ...params, attempt: nextAttempt }).catch(() => {});
  }, BACKOFF_MS[nextAttempt - 1] || 7_200_000);
}

export async function registerAutomation(
  orgId: string,
  userId: string,
  input: {
    name: string;
    endpointUrl: string;
    subscribedEvents: string[];
    description?: string;
  }
) {
  const supabase = createServerServiceClient();
  const secret = randomUUID();
  const { hashSecret } = await import("@/server/security/crypto");

  const { data, error } = await supabase
    .from("automations")
    .insert({
      org_id: orgId,
      name: input.name,
      endpoint_url: input.endpointUrl,
      subscribed_events: input.subscribedEvents,
      description: input.description,
      status: "enabled",
      secret_hash: hashSecret(secret),
    })
    .select()
    .single();

  if (error) throw new Error("Failed to register automation");
  return { automation: data, secretShownOnce: secret };
}
