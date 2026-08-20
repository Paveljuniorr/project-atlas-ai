export const DOMAIN_EVENTS = [
  "lead.created",
  "lead.updated",
  "lead.qualified",
  "lead.disqualified",
  "lead.stage_changed",
  "lead.assigned",
  "message.received",
  "message.sent",
  "conversation.created",
  "conversation.updated",
  "appointment.requested",
  "appointment.created",
  "appointment.cancelled",
  "appointment.rescheduled",
  "automation.started",
  "automation.completed",
  "automation.failed",
  "integration.connected",
  "integration.disconnected",
  "ai.draft_generated",
  "ai.draft_sent",
] as const;

export type DomainEventType = (typeof DOMAIN_EVENTS)[number];

export interface DomainEvent<T = Record<string, unknown>> {
  id: string;
  type: DomainEventType;
  orgId: string;
  createdAt: string;
  data: T;
  correlationId?: string;
}
