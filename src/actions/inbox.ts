"use server";

import { createServerServiceClient } from "@/lib/supabase";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const { userId } = await getAuthSession();

  const supabase = createServerServiceClient();

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      channel,
      status,
      last_message_preview,
      unread_count,
      updated_at,
      lead:leads (
        first_name,
        last_name,
        company_name,
        source
      )
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return conversations;
}

export async function getConversationMessages(conversationId: string) {
  const { userId } = await getAuthSession();

  const supabase = createServerServiceClient();

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return messages;
}

export async function markConversationRead(conversationId: string) {
  const { userId } = await getAuthSession();

  const supabase = createServerServiceClient();

  await supabase
    .from("conversations")
    .update({ unread_count: 0 })
    .eq("id", conversationId);

  revalidatePath("/inbox");
  return { success: true };
}
