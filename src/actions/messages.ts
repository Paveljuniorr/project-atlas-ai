"use server";

import { getUserContext } from "@/lib/rbac";
import { sendOutboundMessage } from "@/server/services/conversation-engine";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(8000),
  aiResponseId: z.string().uuid().optional(),
});

export async function sendMessage(input: z.infer<typeof sendSchema>) {
  try {
    const ctx = await getUserContext("inbox:write");
    const validated = sendSchema.parse(input);

    const result = await sendOutboundMessage({
      orgId: ctx.orgId,
      userId: ctx.userId,
      conversationId: validated.conversationId,
      body: validated.body,
      aiResponseId: validated.aiResponseId,
      isAiAssisted: Boolean(validated.aiResponseId),
    });

    revalidatePath("/inbox");
    return { success: true, ...result };
  } catch (err: unknown) {
    logger.error("sendMessage failed", err);
    throw new Error(err instanceof Error ? err.message : "Failed to send message");
  }
}
