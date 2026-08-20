import { createServerServiceClient } from "@/server/db/client";
import { emitEvent, writeAuditLog } from "@/server/events/event-bus";
import { sanitizeHtml } from "@/lib/security";
import { normalizePhone } from "@/server/security/crypto";
import type { NormalizedMessage } from "@/server/integrations/types";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";

export interface IngestMessageInput {
  orgId: string;
  integrationId?: string;
  message: NormalizedMessage;
  source: string;
  actorUserId?: string;
}

export async function ingestInboundMessage(input: IngestMessageInput) {
  const supabase = createServerServiceClient();
  const { orgId, message, source } = input;
  const body = sanitizeHtml(message.body);

  // Idempotency
  if (message.externalMessageId) {
    const { data: existingKey } = await supabase
      .from("idempotency_keys")
      .select("resource_id")
      .eq("org_id", orgId)
      .eq("source", source)
      .eq("key", message.externalMessageId)
      .maybeSingle();

    if (existingKey) {
      return { duplicate: true, messageId: existingKey.resource_id };
    }
  }

  // Find or create lead by phone/email
  let leadId: string | undefined;
  const phone = message.participantAddress ? normalizePhone(message.participantAddress) : undefined;

  if (phone) {
    const { data: existingLead } = await supabase
      .from("leads")
      .select("id")
      .eq("org_id", orgId)
      .eq("phone", phone)
      .maybeSingle();

    if (existingLead) {
      leadId = existingLead.id;
    } else {
      const { data: newLead, error } = await supabase
        .from("leads")
        .insert({
          org_id: orgId,
          phone,
          source: message.channel,
          stage_id: "new",
          display_name: phone,
        })
        .select("id")
        .single();
      if (error) throw new Error("Failed to create lead");
      leadId = newLead.id;
      await emitEvent("lead.created", orgId, { leadId, source: message.channel });
    }
  }

  if (!leadId) throw new Error("VALIDATION: Could not resolve lead identity");

  // Find or create conversation
  let { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("org_id", orgId)
    .eq("lead_id", leadId)
    .eq("channel", message.channel)
    .maybeSingle();

  if (!conversation) {
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        org_id: orgId,
        lead_id: leadId,
        channel: message.channel,
        participant_address: message.participantAddress,
        integration_id: input.integrationId ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error("Failed to create conversation");
    conversation = newConv;
    await emitEvent("conversation.created", orgId, { conversationId: conversation.id, leadId });
  }

  const { data: msg, error: msgError } = await supabase
    .from("messages")
    .insert({
      org_id: orgId,
      conversation_id: conversation.id,
      lead_id: leadId,
      channel: message.channel,
      direction: "inbound",
      status: "delivered",
      content_type: "text",
      body,
      sender_type: "lead",
      external_message_id: message.externalMessageId ?? null,
    })
    .select("id")
    .single();

  if (msgError) throw new Error("Failed to insert message");

  if (message.externalMessageId) {
    await supabase.from("idempotency_keys").insert({
      org_id: orgId,
      source,
      key: message.externalMessageId,
      resource_type: "message",
      resource_id: msg.id,
    });
  }

  await supabase.rpc("increment_unread_count", { conv_id: conversation.id });
  await supabase
    .from("conversations")
    .update({
      last_message_preview: body.substring(0, 200),
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  await supabase
    .from("leads")
    .update({
      last_message_at: new Date().toISOString(),
      last_contacted_at: new Date().toISOString(),
    })
    .eq("id", leadId);

  await emitEvent("message.received", orgId, {
    messageId: msg.id,
    conversationId: conversation.id,
    leadId,
    channel: message.channel,
  });

  await writeAuditLog({
    orgId,
    action: "message.received",
    entityType: "message",
    entityId: msg.id,
    summary: `Inbound ${message.channel} message received`,
  });

  return { duplicate: false, messageId: msg.id, conversationId: conversation.id, leadId };
}

export async function sendOutboundMessage(params: {
  orgId: string;
  userId: string;
  conversationId: string;
  body: string;
  aiResponseId?: string;
  isAiAssisted?: boolean;
}) {
  const supabase = createServerServiceClient();

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*, lead:leads(*)")
    .eq("id", params.conversationId)
    .eq("org_id", params.orgId)
    .single();

  if (error || !conversation) throw new Error("NOT_FOUND: Conversation not found");

  const body = sanitizeHtml(params.body);
  const integrationType =
    conversation.channel === "email" ? "email" : conversation.channel === "chat" ? "chat_widget" : "whatsapp";

  const { data: pendingMsg, error: insertErr } = await supabase
    .from("messages")
    .insert({
      org_id: params.orgId,
      conversation_id: params.conversationId,
      lead_id: conversation.lead_id,
      channel: conversation.channel,
      direction: "outbound",
      status: "pending",
      content_type: "text",
      body,
      sender_type: "user",
      sender_id: params.userId,
      ai_response_id: params.aiResponseId ?? null,
      is_ai_assisted: params.isAiAssisted ?? false,
    })
    .select("id")
    .single();

  if (insertErr) throw new Error("Failed to create message");

  const to =
    conversation.participant_address ||
    conversation.lead?.phone ||
    conversation.lead?.email;

  if (!to) throw new Error("VALIDATION: No recipient address for this conversation");

  const { sendViaIntegration } = await import("@/server/integrations/integration-service");
  const result = await sendViaIntegration(params.orgId, integrationType, {
    to,
    body,
  });

  await supabase
    .from("messages")
    .update({
      status: result.status,
      external_message_id: result.externalMessageId ?? null,
      error_message: result.errorMessage ?? null,
      sent_at: result.status === "sent" ? new Date().toISOString() : null,
    })
    .eq("id", pendingMsg.id);

  if (result.status === "failed") {
    throw new Error(`PROVIDER: ${result.errorMessage || "Send failed"}`);
  }

  if (params.aiResponseId) {
    await supabase
      .from("ai_responses")
      .update({
        status: params.isAiAssisted ? "accepted" : "edited",
        final_body: body,
        sent_message_id: pendingMsg.id,
        accepted_by_id: params.userId,
      })
      .eq("id", params.aiResponseId)
      .eq("org_id", params.orgId);
  }

  await supabase
    .from("conversations")
    .update({
      last_message_preview: body.substring(0, 200),
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.conversationId);

  await emitEvent("message.sent", params.orgId, {
    messageId: pendingMsg.id,
    conversationId: params.conversationId,
    leadId: conversation.lead_id,
  });

  if (params.isAiAssisted) {
    await emitEvent("ai.draft_sent", params.orgId, {
      aiResponseId: params.aiResponseId,
      messageId: pendingMsg.id,
    });
  }

  return { messageId: pendingMsg.id, status: result.status };
}
