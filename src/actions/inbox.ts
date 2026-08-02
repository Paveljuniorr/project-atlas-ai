"use server";

import { createServerServiceClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const effectiveOrgId = orgId || "default-org-id";
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
    // .eq("org_id", effectiveOrgId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return conversations;
}

export async function getConversationMessages(conversationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

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
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createServerServiceClient();

  await supabase
    .from("conversations")
    .update({ unread_count: 0 })
    .eq("id", conversationId);

  revalidatePath("/inbox");
  return { success: true };
}
