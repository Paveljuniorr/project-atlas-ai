import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { createServerServiceClient } from "@/server/db/client";
import { emitEvent } from "@/server/events/event-bus";
import type { UserContext } from "@/server/auth/context";
import { logger } from "@/lib/logger";

export type AiProviderId = "openai" | "google";

function getModel(provider: AiProviderId) {
  if (provider === "google") return google("gemini-1.5-flash");
  return openai(process.env.OPENAI_MODEL || "gpt-4o-mini");
}

export async function generateReplyDraft(
  ctx: UserContext,
  conversationId: string,
  triggerMessageId?: string
) {
  const supabase = createServerServiceClient();
  const provider: AiProviderId =
    process.env.AI_PROVIDER === "google" ? "google" : "openai";

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, lead_id, channel")
    .eq("id", conversationId)
    .eq("org_id", ctx.orgId)
    .single();

  if (!conversation) throw new Error("NOT_FOUND: Conversation not found");

  const [{ data: messages }, { data: lead }, { data: org }, { data: knowledge }] =
    await Promise.all([
      supabase
        .from("messages")
        .select("body, direction, sender_type")
        .eq("conversation_id", conversationId)
        .eq("org_id", ctx.orgId)
        .order("created_at", { ascending: true })
        .limit(20),
      supabase
        .from("leads")
        .select("*")
        .eq("id", conversation.lead_id)
        .eq("org_id", ctx.orgId)
        .single(),
      supabase.from("organizations").select("ai_settings").eq("id", ctx.orgId).single(),
      supabase
        .from("knowledge_base")
        .select("title, content")
        .eq("org_id", ctx.orgId)
        .eq("is_active", true)
        .limit(10),
    ]);

  const aiSettings = org?.ai_settings || { tone: "professional" };
  const knowledgeText =
    knowledge?.map((k) => `${k.title}: ${k.content}`).join("\n") || "None provided.";

  const historyText =
    messages?.map((m) => `${m.direction === "inbound" ? "Lead" : "Agent"}: ${m.body}`).join("\n") ||
    "";

  const systemPrompt = `You are an AI sales assistant for Project Atlas AI.
Lead: ${lead?.first_name || lead?.display_name || "Unknown"} (${lead?.company_name || "N/A"})
Stage: ${lead?.stage_id || "new"}
Tone: ${aiSettings.tone || "professional"}
Rules: Do not invent pricing or availability. Use knowledge base when relevant.
Knowledge base:
${knowledgeText}`;

  const start = Date.now();
  let text: string;
  try {
    const result = await generateText({
      model: getModel(provider),
      system: systemPrompt,
      prompt: `Conversation (${conversation.channel}):\n${historyText}\n\nDraft a helpful reply:`,
    });
    text = result.text;
  } catch (err) {
    logger.error("ai_generation_failed", err);
    throw new Error("PROVIDER: AI service unavailable");
  }

  const { data: draft, error } = await supabase
    .from("ai_responses")
    .insert({
      org_id: ctx.orgId,
      conversation_id: conversationId,
      lead_id: conversation.lead_id,
      trigger_message_id: triggerMessageId ?? null,
      draft_body: text,
      status: "generated",
      model: { provider, name: provider === "google" ? "gemini-1.5-flash" : "gpt-4o-mini" },
      requested_by_id: ctx.userId,
    })
    .select()
    .single();

  if (error) throw new Error("Failed to save AI draft");

  await emitEvent("ai.draft_generated", ctx.orgId, {
    draftId: draft.id,
    conversationId,
    leadId: conversation.lead_id,
  });

  return draft;
}

/** Controlled AI tools — never expose raw DB access to the model */
export const aiTools = {
  async getLead(ctx: UserContext, leadId: string) {
    const supabase = createServerServiceClient();
    const { data } = await supabase
      .from("leads")
      .select("id, first_name, last_name, email, phone, company_name, stage_id, source, score, intent, notes")
      .eq("id", leadId)
      .eq("org_id", ctx.orgId)
      .single();
    return data;
  },

  async updateLead(ctx: UserContext, leadId: string, updates: Record<string, unknown>) {
    const { updateLeadRecord } = await import("@/server/services/lead-service");
    return updateLeadRecord(ctx, leadId, updates);
  },

  async searchKnowledgeBase(ctx: UserContext, query: string) {
    const supabase = createServerServiceClient();
    const { data } = await supabase
      .from("knowledge_base")
      .select("title, content")
      .eq("org_id", ctx.orgId)
      .eq("is_active", true)
      .ilike("content", `%${query}%`)
      .limit(5);
    return data ?? [];
  },

  async getAvailableSlots(ctx: UserContext, from: string, to: string, durationMinutes = 30) {
    const { getAvailableAppointmentSlots } = await import("@/server/services/appointment-service");
    return getAvailableAppointmentSlots(ctx.orgId, from, to, durationMinutes);
  },

  async createAppointment(
    ctx: UserContext,
    input: {
      leadId: string;
      title: string;
      startsAt: string;
      endsAt: string;
      attendeeEmail?: string;
      attendeeName?: string;
    }
  ) {
    const { createAppointment } = await import("@/server/services/appointment-service");
    return createAppointment(ctx, input);
  },
};

export async function detectAppointmentIntent(message: string): Promise<boolean> {
  const keywords = ["demo", "meeting", "call", "schedule", "appointment", "book", "available"];
  const lower = message.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}
