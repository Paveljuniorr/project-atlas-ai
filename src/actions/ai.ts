"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createServerServiceClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function generateAiDraft(conversationId: string, triggerMessageId: string) {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createServerServiceClient();

  // 1. Fetch conversation history
  const { data: messages } = await supabase
    .from("messages")
    .select("body, direction, sender_type")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  // 2. Fetch Lead context
  const { data: conversation } = await supabase
    .from("conversations")
    .select("lead_id")
    .eq("id", conversationId)
    .single();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", conversation?.lead_id)
    .single();

  // 3. Fetch Org AI settings
  const { data: org } = await supabase
    .from("organizations")
    .select("ai_settings")
    // .eq("id", orgId) // uncomment in real multi-tenant
    .single();

  const tone = org?.ai_settings?.tone || "professional";

  // Formulate the prompt context
  let historyText = messages?.map(m => `${m.direction === 'inbound' ? 'Lead' : 'Agent'}: ${m.body}`).join("\n") || "";
  
  const systemPrompt = `
    You are an AI sales assistant for ${lead?.company_name || 'our company'}.
    The lead's name is ${lead?.first_name || 'Unknown'}.
    Your tone should be ${tone}.
    Write a concise, helpful response to the last message in the thread.
    Do not invent pricing or availability. Suggest a next step if appropriate.
  `;

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: `Here is the conversation history:\n${historyText}\n\nDraft a response:`,
    });

    // 4. Save the AI Response draft to Supabase
    const { data: draft, error } = await supabase
      .from("ai_responses")
      .insert({
        conversation_id: conversationId,
        lead_id: lead?.id,
        trigger_message_id: triggerMessageId,
        draft_body: text,
        status: "generated",
        model: { provider: "google", name: "gemini-1.5-flash" },
        requested_by_id: userId,
        // org_id: orgId 
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw new Error("Failed to save draft");
    }

    revalidatePath("/inbox");
    return { success: true, draft };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate AI draft");
  }
}
