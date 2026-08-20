import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { generateReplyDraft } from "@/server/ai/ai-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

const schema = z.object({
  conversationId: z.string().uuid(),
  triggerMessageId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext("ai:generate");
    const body = schema.parse(await req.json());
    const draft = await generateReplyDraft(ctx, body.conversationId, body.triggerMessageId);
    return apiSuccess(draft, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
