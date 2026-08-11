"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createServerServiceClient } from "@/lib/supabase";
import { getUserContext } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateAiDraftSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function generateAiDraft(conversationId: string, triggerMessageId?: string) {
  try {
    const { userId, orgId } = await getUserContext("ai:generate");

    const rate = checkRateLimit(`ai:generate:${userId}`, 10, 60000);
    if (!rate.allowed) {
      throw new Error("AI generation rate limit exceeded. Please wait a moment.");
    }

    const validated = generateAiDraftSchema.parse({ conversationId, triggerMessageId });

    const supabase = createServerServiceClient();

    // 1. Fetch conversation and verify tenant ownership
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, lead_id, org_id")
      .eq("id", validated.conversationId)
      .eq("org_id", orgId)
      .single();

    if (convError || !conversation) {
      throw new Error("Conversation not found or access denied");
    }

    // 2. Fetch conversation history scoped by org_id
    const { data: messages } = await supabase
      .from("messages")
      .select("body, direction, sender_type")
      .eq("conversation_id", validated.conversationId)
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });

    // 3. Fetch Lead context scoped by org_id
    const { data: lead } = await supabase
      .from("leads")
      .select("id, first_name, company_name")
      .eq("id", conversation.lead_id)
      .eq("org_id", orgId)
      .single();

    // 4. Fetch Org AI settings
    const { data: org } = await supabase
      .from("organizations")
      .select("ai_settings")
      .eq("id", orgId)
      .single();

    const tone = org?.ai_settings?.tone || "professional";

    const historyText = messages?.map(m => `${m.direction === 'inbound' ? 'Lead' : 'Agent'}: ${m.body}`).join("\n") || "";

    const systemPrompt = `
      You are an AI sales assistant for ${lead?.company_name || 'our company'}.
      The lead's name is ${lead?.first_name || 'Unknown'}.
      Your tone should be ${tone}.
      Write a concise, helpful response to the last message in the thread.
      Do not invent pricing or availability. Suggest a next step if appropriate.
    `;

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: `Here is the conversation history:\n${historyText}\n\nDraft a response:`,
    });

    const { data: draft, error: insertError } = await supabase
      .from("ai_responses")
      .insert({
        org_id: orgId,
        conversation_id: validated.conversationId,
        lead_id: lead?.id,
        trigger_message_id: validated.triggerMessageId || null,
        draft_body: text,
        status: "generated",
        model: { provider: "google", name: "gemini-1.5-flash" },
        requested_by_id: userId,
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Failed to insert AI response draft", insertError, { orgId });
      throw new Error("Failed to save AI response draft");
    }

    revalidatePath("/inbox");
    return { success: true, draft };
  } catch (err: any) {
    logger.error("generateAiDraft error", err);
    throw new Error(err.message || "Failed to generate AI draft");
  }
}
