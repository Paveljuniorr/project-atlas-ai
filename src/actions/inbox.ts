"use server";

import { createServerServiceClient } from "@/lib/supabase";
import { getUserContext } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { uuidSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  try {
    const { orgId } = await getUserContext("inbox:read");

    const rate = checkRateLimit(`inbox:read:${orgId}`, 60, 60000);
    if (!rate.allowed) {
      throw new Error("Rate limit exceeded");
    }

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
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false });

    if (error) {
      logger.error("Error fetching conversations", error, { orgId });
      return [];
    }

    return conversations || [];
  } catch (err: any) {
    logger.error("getConversations failed", err);
    throw new Error(err.message || "Failed to fetch conversations");
  }
}

export async function getConversationMessages(conversationId: string) {
  try {
    const { orgId } = await getUserContext("inbox:read");

    const supabase = createServerServiceClient();

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Error fetching conversation messages", error, { conversationId, orgId });
      return [];
    }

    return messages || [];
  } catch (err: any) {
    logger.error("getConversationMessages failed", err);
    throw new Error(err.message || "Failed to fetch messages");
  }
}

export async function markConversationRead(conversationId: string) {
  try {
    const { orgId } = await getUserContext("inbox:write");

    const supabase = createServerServiceClient();

    const { error } = await supabase
      .from("conversations")
      .update({ unread_count: 0 })
      .eq("id", conversationId)
      .eq("org_id", orgId);

    if (error) {
      logger.error("Error marking conversation as read", error, { conversationId, orgId });
      throw new Error("Failed to mark conversation read");
    }

    revalidatePath("/inbox");
    return { success: true };
  } catch (err: any) {
    logger.error("markConversationRead failed", err);
    throw new Error(err.message || "Failed to update conversation");
  }
}
