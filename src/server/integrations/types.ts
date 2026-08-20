
export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed" | "received";

export interface NormalizedMessage {
  externalMessageId?: string;
  channel: string;
  direction: MessageDirection;
  body: string;
  participantAddress?: string;
  subject?: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageParams {
  orgId: string;
  integrationId: string;
  to: string;
  body: string;
  subject?: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageResult {
  externalMessageId?: string;
  status: MessageStatus;
  errorMessage?: string;
}

export interface IntegrationProvider {
  readonly providerId: string;
  readonly type: string;
  connect(credentials?: Record<string, unknown>): Promise<{ config: Record<string, unknown> }>;
  disconnect(): Promise<void>;
  validateCredentials(credentials?: Record<string, unknown>): Promise<boolean>;
  sendMessage(params: SendMessageParams): Promise<SendMessageResult>;
  parseInboundWebhook(payload: unknown, headers: Headers): Promise<NormalizedMessage | null>;
  getStatus(): Promise<{ healthy: boolean; message?: string }>;
  refreshToken?(): Promise<Record<string, unknown>>;
}

export interface MessagingProvider extends IntegrationProvider {
  createWebhook?(url: string): Promise<void>;
  removeWebhook?(): Promise<void>;
}

export interface EmailProvider extends IntegrationProvider {
  sendEmail(params: SendMessageParams & { html?: string }): Promise<SendMessageResult>;
}

export interface CalendarSlot {
  startsAt: string;
  endsAt: string;
}

export interface CalendarProvider extends IntegrationProvider {
  getAvailableSlots(params: {
    orgId: string;
    from: string;
    to: string;
    durationMinutes: number;
    timezone: string;
  }): Promise<CalendarSlot[]>;
  createAppointment(params: {
    orgId: string;
    title: string;
    startsAt: string;
    endsAt: string;
    attendeeEmail?: string;
    attendeeName?: string;
    timezone: string;
  }): Promise<{ externalEventId: string; meetingLink?: string }>;
  cancelAppointment(externalEventId: string): Promise<void>;
}

export type ProviderFactory = (config: Record<string, unknown>, credentials?: string) => IntegrationProvider;
