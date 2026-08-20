"use server";

import { generateReplyDraft } from "@/server/ai/ai-service";
import { getUserContext } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateAiDraftSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function generateAiDraft(conversationId: string, triggerMessageId?: string) {
  try {
    const ctx = await getUserContext("ai:generate");
    const rate = checkRateLimit(`ai:generate:${ctx.userId}`, 10, 60000);
    if (!rate.allowed) {
      throw new Error("AI generation rate limit exceeded. Please wait a moment.");
    }

    const validated = generateAiDraftSchema.parse({ conversationId, triggerMessageId });
    const draft = await generateReplyDraft(ctx, validated.conversationId, validated.triggerMessageId);

    revalidatePath("/inbox");
    return { success: true, draft };
  } catch (err: unknown) {
    logger.error("generateAiDraft error", err);
    throw new Error(err instanceof Error ? err.message : "Failed to generate AI draft");
  }
}

export async function acceptAiDraftAndSend(
  conversationId: string,
  aiResponseId: string,
  body: string
) {
  try {
    const ctx = await getUserContext("inbox:write");
    const { sendOutboundMessage } = await import("@/server/services/conversation-engine");

    const result = await sendOutboundMessage({
      orgId: ctx.orgId,
      userId: ctx.userId,
      conversationId,
      body,
      aiResponseId,
      isAiAssisted: true,
    });

    revalidatePath("/inbox");
    return { success: true, ...result };
  } catch (err: unknown) {
    logger.error("acceptAiDraftAndSend error", err);
    throw new Error(err instanceof Error ? err.message : "Failed to send message");
  }
}
