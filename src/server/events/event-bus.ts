import { createServerServiceClient } from "@/server/db/client";
import { logger } from "@/lib/logger";
import type { DomainEvent, DomainEventType } from "./types";
import { dispatchAutomationWebhooks } from "@/server/automation/dispatcher";
import { randomUUID } from "crypto";

type EventHandler = (event: DomainEvent) => Promise<void>;

const handlers: EventHandler[] = [
  async (event) => {
    await dispatchAutomationWebhooks(event);
  },
];

export async function emitEvent<T extends Record<string, unknown>>(
  type: DomainEventType,
  orgId: string,
  data: T,
  correlationId?: string
): Promise<DomainEvent<T>> {
  const event: DomainEvent<T> = {
    id: `evt_${randomUUID()}`,
    type,
    orgId,
    createdAt: new Date().toISOString(),
    data,
    correlationId,
  };

  logger.info("domain_event", { type, orgId, eventId: event.id });

  for (const handler of handlers) {
    try {
      await handler(event);
    } catch (err) {
      logger.error("event_handler_failed", err, { type, orgId, eventId: event.id });
    }
  }

  return event;
}

export async function writeAuditLog(params: {
  orgId: string;
  actorUserId?: string;
  actorType?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  correlationId?: string;
}) {
  const supabase = createServerServiceClient();
  await supabase.from("audit_logs").insert({
    org_id: params.orgId,
    actor_user_id: params.actorUserId ?? null,
    actor_type: params.actorType ?? "user",
    action: params.action,
    entity_type: params.entityType ?? null,
    entity_id: params.entityId ?? null,
    summary: params.summary,
    metadata: params.metadata ?? {},
    ip_address: params.ipAddress ?? null,
    correlation_id: params.correlationId ?? null,
  });
}
