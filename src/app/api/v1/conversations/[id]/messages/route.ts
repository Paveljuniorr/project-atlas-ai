import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { sendOutboundMessage } from "@/server/services/conversation-engine";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

const sendSchema = z.object({
  body: z.string().min(1).max(8000),
  aiResponseId: z.string().uuid().optional(),
  isAiAssisted: z.boolean().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getUserContext("inbox:write");
    const { id: conversationId } = await params;
    const body = sendSchema.parse(await req.json());

    const result = await sendOutboundMessage({
      orgId: ctx.orgId,
      userId: ctx.userId,
      conversationId,
      body: body.body,
      aiResponseId: body.aiResponseId,
      isAiAssisted: body.isAiAssisted ?? Boolean(body.aiResponseId),
    });

    return apiSuccess(result, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
