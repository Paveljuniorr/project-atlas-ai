import type { MessagingProvider, SendMessageParams, SendMessageResult, NormalizedMessage } from "../types";
import { logger } from "@/lib/logger";

export class TwilioWhatsAppProvider implements MessagingProvider {
  readonly providerId = "twilio";
  readonly type = "whatsapp";

  constructor(
    private accountSid: string,
    private authToken: string,
    private fromNumber: string
  ) {}

  async connect() {
    return { config: { fromNumber: this.fromNumber, provider: this.providerId } };
  }
  async disconnect() {}
  async validateCredentials() {
    return Boolean(this.accountSid && this.authToken && this.fromNumber);
  }
  async getStatus() {
    return { healthy: await this.validateCredentials() };
  }

  async sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
    const to = params.to.startsWith("whatsapp:") ? params.to : `whatsapp:${params.to}`;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const body = new URLSearchParams({
      From: this.fromNumber.startsWith("whatsapp:") ? this.fromNumber : `whatsapp:${this.fromNumber}`,
      To: to,
      Body: params.body,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await res.json();
    if (!res.ok) {
      logger.error("twilio_send_failed", data);
      return { status: "failed", errorMessage: data.message || "Twilio send failed" };
    }
    return { status: "sent", externalMessageId: data.sid };
  }

  async parseInboundWebhook(payload: unknown): Promise<NormalizedMessage | null> {
    const p = payload as Record<string, string>;
    if (!p.From || !p.Body) return null;
    const channel = p.From.startsWith("whatsapp:") ? "whatsapp" : "sms";
    return {
      externalMessageId: p.MessageSid,
      channel,
      direction: "inbound",
      body: p.Body,
      participantAddress: p.From.replace("whatsapp:", ""),
    };
  }
}

export class WhatsAppCloudProvider implements MessagingProvider {
  readonly providerId = "whatsapp_cloud";
  readonly type = "whatsapp";

  constructor(
    private accessToken: string,
    private phoneNumberId: string
  ) {}

  async connect() {
    return { config: { phoneNumberId: this.phoneNumberId, provider: this.providerId } };
  }
  async disconnect() {}
  async validateCredentials() {
    return Boolean(this.accessToken && this.phoneNumberId);
  }
  async getStatus() {
    return { healthy: await this.validateCredentials() };
  }

  async sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
    const to = params.to.replace(/\D/g, "");
    const res = await fetch(`https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: params.body },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { status: "failed", errorMessage: data.error?.message || "WhatsApp Cloud send failed" };
    }
    return { status: "sent", externalMessageId: data.messages?.[0]?.id };
  }

  async parseInboundWebhook(payload: unknown): Promise<NormalizedMessage | null> {
    const body = payload as any;
    const entry = body?.entry?.[0]?.changes?.[0]?.value;
    const msg = entry?.messages?.[0];
    if (!msg) return null;
    return {
      externalMessageId: msg.id,
      channel: "whatsapp",
      direction: "inbound",
      body: msg.text?.body || "",
      participantAddress: msg.from,
      metadata: { raw: body },
    };
  }
}

export class ResendEmailProvider implements MessagingProvider {
  readonly providerId = "resend";
  readonly type = "email";

  constructor(
    private apiKey: string,
    private fromEmail: string
  ) {}

  async connect() {
    return { config: { fromEmail: this.fromEmail, provider: this.providerId } };
  }
  async disconnect() {}
  async validateCredentials() {
    return Boolean(this.apiKey && this.fromEmail);
  }
  async getStatus() {
    return { healthy: await this.validateCredentials() };
  }

  async sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: params.to,
        subject: params.subject || "Message from Project Atlas AI",
        text: params.body,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { status: "failed", errorMessage: data.message || "Resend send failed" };
    }
    return { status: "sent", externalMessageId: data.id };
  }

  async parseInboundWebhook(): Promise<NormalizedMessage | null> {
    return null;
  }
}

export function createMessagingProvider(
  providerId: string,
  credentials: Record<string, string>
): MessagingProvider {
  switch (providerId) {
    case "twilio":
      return new TwilioWhatsAppProvider(
        credentials.accountSid,
        credentials.authToken,
        credentials.fromNumber
      );
    case "whatsapp_cloud":
      return new WhatsAppCloudProvider(credentials.accessToken, credentials.phoneNumberId);
    case "resend":
      return new ResendEmailProvider(credentials.apiKey, credentials.fromEmail);
    default:
      throw new Error(`PROVIDER: Unknown messaging provider: ${providerId}`);
  }
}
